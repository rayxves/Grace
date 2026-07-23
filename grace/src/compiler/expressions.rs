use std::rc::Rc;

use super::Compiler;
use crate::{
    chunk::opcode::OpCode,
    expr::{ExprVisitor, Expression},
    token::{BinaryOp, LogicalOp, Token, TokenLiteral, UnaryOp},
    value::Value,
};

impl ExprVisitor for Compiler {
    type Output = ();

    fn visit_binary(
        &mut self,
        id: usize,
        left: &Expression,
        operator: &BinaryOp,
        line: &u64,
        right: &Expression,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Binary", Some(*line));
        left.accept(self);
        right.accept(self);
        match operator {
            BinaryOp::Plus => self.emit_op(OpCode::Add, *line, Some(id)),
            BinaryOp::Minus => self.emit_op(OpCode::Subtract, *line, Some(id)),
            BinaryOp::Star => self.emit_op(OpCode::Multiply, *line, Some(id)),
            BinaryOp::Slash => self.emit_op(OpCode::Divide, *line, Some(id)),
            BinaryOp::EqualEqual => self.emit_op(OpCode::Equal, *line, Some(id)),
            BinaryOp::Greater => self.emit_op(OpCode::Greater, *line, Some(id)),
            BinaryOp::Less => self.emit_op(OpCode::Less, *line, Some(id)),
            BinaryOp::BangEqual => {
                self.emit_op(OpCode::Equal, *line, Some(id));
                self.emit_op(OpCode::Not, *line, Some(id))
            }
            BinaryOp::GreaterEqual => {
                self.emit_op(OpCode::Less, *line, Some(id));
                self.emit_op(OpCode::Not, *line, Some(id))
            }
            BinaryOp::LessEqual => {
                self.emit_op(OpCode::Greater, *line, Some(id));
                self.emit_op(OpCode::Not, *line, Some(id))
            }
        };
    }

    fn visit_literal(&mut self, id: usize, literal: &TokenLiteral, line: u64) -> Self::Output {
        let _guard = self.enter_node(id, "Literal", Some(line));
        match literal {
            TokenLiteral::Number(n) => self.emit_constant(Value::Number(*n), line, Some(id)),
            TokenLiteral::StringLiteral(s) => {
                self.emit_constant(Value::Str(s.clone()), line, Some(id))
            }
            TokenLiteral::Boolean(true) => self.emit_op(OpCode::True, line, Some(id)),
            TokenLiteral::Boolean(false) => self.emit_op(OpCode::False, line, Some(id)),
            TokenLiteral::Null => self.emit_op(OpCode::Null, line, Some(id)),
        }
    }

    fn visit_unary(
        &mut self,
        id: usize,
        unary_op: &UnaryOp,
        line: &u64,
        expr: &Expression,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Unary", Some(*line));
        expr.accept(self);
        let opcode = match unary_op {
            UnaryOp::Minus => OpCode::Negate,
            UnaryOp::Bang => OpCode::Not,
        };
        self.emit_op(opcode, *line, Some(id));
    }

    fn visit_grouping(&mut self, id: usize, expr: &Expression) -> Self::Output {
        let _guard = self.enter_node(id, "Grouping", None);
        expr.accept(self);
    }

    fn visit_variable(&mut self, name: &String, line: u64, id: usize) -> Self::Output {
        let _guard = self.enter_node(id, "Variable", Some(line));
        match self.resolve_local(name) {
            Some(slot) => self.emit_with_operand(OpCode::GetLocal, slot as u8, line, Some(id)),
            None => {
                self.emit_named(OpCode::GetGlobal, Value::Str(name.to_string()), line, Some(id))
            }
        }
    }

    fn visit_assign(
        &mut self,
        name: &String,
        line: u64,
        expr: &Expression,
        id: usize,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Assign", Some(line));
        expr.accept(self);
        match self.resolve_local(name) {
            Some(slot) => self.emit_with_operand(OpCode::SetLocal, slot as u8, line, Some(id)),
            None => {
                self.emit_named(OpCode::SetGlobal, Value::Str(name.to_string()), line, Some(id))
            }
        }
    }

    fn visit_logical(
        &mut self,
        id: usize,
        left: &Expression,
        operator: &LogicalOp,
        line: &u64,
        right: &Expression,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Logical", Some(*line));
        match operator {
            LogicalOp::And => {
                left.accept(self);
                let end_jump = self.emit_jump(OpCode::JumpIfFalse, *line, Some(id));
                self.emit_op(OpCode::Pop, *line, Some(id));
                right.accept(self);
                self.patch_jump(end_jump);
            }
            LogicalOp::Or => {
                left.accept(self);
                let else_jump = self.emit_jump(OpCode::JumpIfFalse, *line, Some(id));
                let end_jump = self.emit_jump(OpCode::Jump, *line, Some(id));
                self.patch_jump(else_jump);
                self.emit_op(OpCode::Pop, *line, Some(id));
                right.accept(self);
                self.patch_jump(end_jump);
            }
        }
    }

    fn visit_call(
        &mut self,
        id: usize,
        callee: &Expression,
        args: &Vec<Expression>,
        paren: &Token,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Call", Some(paren.line));
        callee.accept(self);
        for arg in args {
            arg.accept(self);
        }
        self.emit_with_operand(OpCode::Call, args.len() as u8, paren.line, Some(id));
    }

    fn visit_get(&mut self, id: usize, expr: &Expression, token: &Token) -> Self::Output {
        let _guard = self.enter_node(id, "Get", Some(token.line));
        expr.accept(self);
        self.emit_named(
            OpCode::GetProperty,
            Value::Str(token.lexeme.clone()),
            token.line,
            Some(id),
        );
    }

    fn visit_set(
        &mut self,
        id: usize,
        expr: &Expression,
        token: &Token,
        value: &Expression,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Set", Some(token.line));
        expr.accept(self);
        value.accept(self);
        self.emit_named(
            OpCode::SetProperty,
            Value::Str(token.lexeme.clone()),
            token.line,
            Some(id),
        );
    }

    fn visit_this(&mut self, token: &Token, id: usize) -> Self::Output {
        let _guard = self.enter_node(id, "This", Some(token.line));
        self.emit_with_operand(OpCode::GetLocal, 0, token.line, Some(id));
    }

    fn visit_super(&mut self, key_super: &Token, method: &Token, id: usize) -> Self::Output {
        let _guard = self.enter_node(id, "Super", Some(key_super.line));
        let parent = match &self.current_class {
            Some(class) => match &class.superclass {
                Some(p) => p.clone(),
                None => {
                    let message = format!(
                        "A classe '{}' não herda de ninguém, então não é possível usar 'super' aqui. \
                         Para herdar, declare 'classe {} < NomeDaSuperclasse'.",
                        class.name, class.name
                    );
                    self.error(message, key_super.line);
                    return;
                }
            },
            None => {
                self.error(
                    "'super' só pode ser usado dentro de um método de uma classe.".to_string(),
                    key_super.line,
                );
                return;
            }
        };

        let parent_method = match parent.methods.get(&method.lexeme) {
            Some(m) => m.clone(),
            None => {
                let available = available_methods(&parent);
                let message = format!(
                    "O método '{}' não existe na superclasse '{}'. Métodos disponíveis em '{}': {}.",
                    method.lexeme, parent.name, parent.name, available
                );
                self.error(message, method.line);
                return;
            }
        };

        self.emit_with_operand(OpCode::GetLocal, 0, method.line, Some(id));
        self.emit_named(
            OpCode::GetSuper,
            Value::Function(parent_method),
            method.line,
            Some(id),
        );
    }
}

fn available_methods(class: &Rc<crate::value::Class>) -> String {
    if class.methods.is_empty() {
        "nenhum".to_string()
    } else {
        let mut names: Vec<String> = class.methods.keys().map(|n| format!("'{}'", n)).collect();
        names.sort();
        names.join(", ")
    }
}
