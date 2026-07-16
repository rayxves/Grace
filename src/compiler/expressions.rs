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
        left: &Expression,
        operator: &BinaryOp,
        line: &u64,
        right: &Expression,
    ) -> Self::Output {
        left.accept(self);
        right.accept(self);
        match operator {
            BinaryOp::Plus => self.emit_op(OpCode::Add, *line),
            BinaryOp::Minus => self.emit_op(OpCode::Subtract, *line),
            BinaryOp::Star => self.emit_op(OpCode::Multiply, *line),
            BinaryOp::Slash => self.emit_op(OpCode::Divide, *line),
            BinaryOp::EqualEqual => self.emit_op(OpCode::Equal, *line),
            BinaryOp::Greater => self.emit_op(OpCode::Greater, *line),
            BinaryOp::Less => self.emit_op(OpCode::Less, *line),
            BinaryOp::BangEqual => {
                self.emit_op(OpCode::Equal, *line);
                self.emit_op(OpCode::Not, *line)
            }
            BinaryOp::GreaterEqual => {
                self.emit_op(OpCode::Less, *line);
                self.emit_op(OpCode::Not, *line)
            }
            BinaryOp::LessEqual => {
                self.emit_op(OpCode::Greater, *line);
                self.emit_op(OpCode::Not, *line)
            }
        };
    }

    fn visit_literal(&mut self, literal: &TokenLiteral, line: u64) -> Self::Output {
        match literal {
            TokenLiteral::Number(n) => self.emit_constant(Value::Number(*n), line),
            TokenLiteral::StringLiteral(s) => self.emit_constant(Value::Str(s.clone()), line),
            TokenLiteral::Boolean(true) => self.emit_op(OpCode::True, line),
            TokenLiteral::Boolean(false) => self.emit_op(OpCode::False, line),
            TokenLiteral::Null => self.emit_op(OpCode::Null, line),
        }
    }

    fn visit_unary(&mut self, unary_op: &UnaryOp, line: &u64, expr: &Expression) -> Self::Output {
        expr.accept(self);
        let opcode = match unary_op {
            UnaryOp::Minus => OpCode::Negate,
            UnaryOp::Bang => OpCode::Not,
        };
        self.emit_op(opcode, *line);
    }

    fn visit_grouping(&mut self, expr: &Expression) -> Self::Output {
        expr.accept(self);
    }

    fn visit_variable(&mut self, name: &String, line: u64, _id: usize) -> Self::Output {
        match self.resolve_local(name) {
            Some(slot) => self.emit_with_operand(OpCode::GetLocal, slot as u8, line),
            None => self.emit_named(OpCode::GetGlobal, Value::Str(name.to_string()), line),
        }
    }

    fn visit_assign(
        &mut self,
        name: &String,
        line: u64,
        expr: &Expression,
        _id: usize,
    ) -> Self::Output {
        expr.accept(self);
        match self.resolve_local(name) {
            Some(slot) => self.emit_with_operand(OpCode::SetLocal, slot as u8, line),
            None => self.emit_named(OpCode::SetGlobal, Value::Str(name.to_string()), line),
        }
    }

    fn visit_logical(
        &mut self,
        left: &Expression,
        operator: &LogicalOp,
        line: &u64,
        right: &Expression,
    ) -> Self::Output {
        match operator {
            LogicalOp::And => {
                left.accept(self);
                let end_jump = self.emit_jump(OpCode::JumpIfFalse, *line);
                self.emit_op(OpCode::Pop, *line);
                right.accept(self);
                self.patch_jump(end_jump);
            }
            LogicalOp::Or => {
                left.accept(self);
                let else_jump = self.emit_jump(OpCode::JumpIfFalse, *line);
                let end_jump = self.emit_jump(OpCode::Jump, *line);
                self.patch_jump(else_jump);
                self.emit_op(OpCode::Pop, *line);
                right.accept(self);
                self.patch_jump(end_jump);
            }
        }
    }

    fn visit_call(
        &mut self,
        callee: &Expression,
        args: &Vec<Expression>,
        paren: &Token,
    ) -> Self::Output {
        callee.accept(self);
        for arg in args {
            arg.accept(self);
        }
        self.emit_with_operand(OpCode::Call, args.len() as u8, paren.line);
    }

    fn visit_get(&mut self, expr: &Expression, token: &Token) -> Self::Output {
        expr.accept(self);
        self.emit_named(
            OpCode::GetProperty,
            Value::Str(token.lexeme.clone()),
            token.line,
        );
    }

    fn visit_set(&mut self, expr: &Expression, token: &Token, value: &Expression) -> Self::Output {
        expr.accept(self);
        value.accept(self);
        self.emit_named(
            OpCode::SetProperty,
            Value::Str(token.lexeme.clone()),
            token.line,
        );
    }

    fn visit_this(&mut self, token: &Token, _id: usize) -> Self::Output {
        self.emit_with_operand(OpCode::GetLocal, 0, token.line);
    }

    fn visit_super(&mut self, key_super: &Token, method: &Token, _id: usize) -> Self::Output {
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

        self.emit_with_operand(OpCode::GetLocal, 0, method.line);
        self.emit_named(OpCode::GetSuper, Value::Function(parent_method), method.line);
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