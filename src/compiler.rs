use std::{collections::HashMap, rc::Rc, vec};

use crate::{
    chunk::{Chunk, opcode::OpCode},
    events::{CompileEvent, Event::Compile, SharedSink},
    expr::{ExprVisitor, Expression},
    stmt::{Statement, StmtVisitor},
    token::{BinaryOp, LogicalOp, TokenLiteral, UnaryOp},
    value::{
        Class,
        Value::{self},
        function::Function,
    },
};
pub struct Locals {
    name: String,
    depth: usize,
}

pub struct Compiler {
    chunk: Chunk,
    sink: SharedSink,
    locals: Vec<Locals>,
    scope_depth: usize,
}

impl Compiler {
    pub fn new(sink: SharedSink) -> Compiler {
        Compiler {
            chunk: Chunk::new(),
            sink,
            locals: vec![Locals {
                name: String::new(),
                depth: 0,
            }],
            scope_depth: 0,
        }
    }

    pub fn emit_op(&mut self, opcode: OpCode, line: u64) {
        let offset = self.chunk.code.len();
        self.chunk.append(opcode as u8, line);
        self.sink.borrow_mut().emit(Compile(CompileEvent::Emit {
            offset,
            opcode: format!("{:?}", opcode),
            line,
        }));
    }

    pub fn emit_constant(&mut self, value: Value, line: u64) {
        let index = self.chunk.add_constant(value);
        self.emit_op(OpCode::Constant, line);
        self.chunk.append(index as u8, line);
    }

    pub fn emit_named(&mut self, opcode: OpCode, value: Value, line: u64) {
        let index = self.chunk.add_constant(value);
        self.emit_op(opcode, line);
        self.chunk.append(index as u8, line);
    }

    pub fn emit_jump(&mut self, opcode: OpCode, line: u64) -> usize {
        self.emit_op(opcode, line);
        self.chunk.append(0xff, line);
        self.chunk.code.len() - 1
    }

    pub fn patch_jump(&mut self, placehoder: usize) {
        let jump = self.chunk.code.len() - placehoder - 1;
        self.chunk.code[placehoder] = jump as u8;
    }

    pub fn emit_loop(&mut self, loop_start: usize, line: u64) {
        self.emit_op(OpCode::Loop, line);
        let offset = self.chunk.code.len() + 1 - loop_start;
        self.chunk.append(offset as u8, line);
    }

    pub fn compile(&mut self, statements: &Vec<Statement>) {
        for stmt in statements {
            stmt.accept(self);
        }
        self.emit_op(OpCode::Return, 0);
    }

    pub fn into_chunk(self) -> Chunk {
        self.chunk
    }

    pub fn begin_scope(&mut self) {
        self.scope_depth += 1;
    }

    pub fn end_scope(&mut self) {
        self.scope_depth -= 1;
        while let Some(local) = self.locals.last() {
            if local.depth > self.scope_depth {
                self.emit_op(OpCode::Pop, 0);
                self.locals.pop();
            } else {
                break;
            }
        }
    }

    pub fn add_local(&mut self, name: String) {
        self.locals.push(Locals {
            name,
            depth: self.scope_depth,
        });
    }

    pub fn resolve_local(&self, name: String) -> Option<usize> {
        for i in (0..self.locals.len()).rev() {
            if self.locals[i].name == name {
                return Some(i);
            }
        }
        None
    }
    fn compile_function(
        &mut self,
        name: &str,
        params: &Vec<String>,
        body: &Vec<Statement>,
    ) -> Function {
        let mut fn_compiler = Compiler::new(self.sink.clone());
        fn_compiler.begin_scope();
        for param in params {
            fn_compiler.add_local(param.to_string());
        }
        for stmt in body {
            stmt.accept(&mut fn_compiler);
        }
        fn_compiler.emit_op(OpCode::Null, 0);
        fn_compiler.emit_op(OpCode::Return, 0);
        let fn_chunk = fn_compiler.into_chunk();
        Function::new(name.to_string(), params.len() as u64, fn_chunk) // DEVOLVE a função
    }
}

impl ExprVisitor for Compiler {
    type Output = ();

    fn visit_binary(
        &mut self,
        left: &crate::expr::Expression,
        operator: &crate::token::BinaryOp,
        line: &u64,
        right: &crate::expr::Expression,
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

    fn visit_literal(&mut self, literal: &crate::token::TokenLiteral) -> Self::Output {
        match literal {
            TokenLiteral::Number(n) => {
                self.emit_constant(Value::Number(*n), 0); // TODO: linha real do literal
            }
            TokenLiteral::Boolean(true) => {
                self.emit_op(OpCode::True, 0);
            }
            TokenLiteral::Boolean(false) => {
                self.emit_op(OpCode::False, 0);
            }
            TokenLiteral::Null => {
                self.emit_op(OpCode::Null, 0);
            }
            _ => todo!("Bool/String/Null quando a VM tiver esses Value"),
        }
    }

    fn visit_unary(
        &mut self,
        unary_op: &crate::token::UnaryOp,
        line: &u64,
        expr: &crate::expr::Expression,
    ) -> Self::Output {
        expr.accept(self);
        let opcode = match unary_op {
            UnaryOp::Minus => OpCode::Negate,
            UnaryOp::Bang => OpCode::Not,
        };
        self.emit_op(opcode, *line);
    }

    fn visit_grouping(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        expr.accept(self);
    }

    fn visit_variable(&mut self, name: &String, line: u64, id: usize) -> Self::Output {
        match self.resolve_local(name.to_string()) {
            Some(slot) => {
                self.emit_op(OpCode::GetLocal, line);
                self.chunk.append(slot as u8, line);
            }
            None => {
                self.emit_named(OpCode::GetGlobal, Value::Str(name.to_string()), line);
            }
        }
    }

    fn visit_assign(
        &mut self,
        name: &String,
        line: u64,
        expr: &crate::expr::Expression,
        id: usize,
    ) -> Self::Output {
        expr.accept(self);
        match self.resolve_local(name.to_string()) {
            Some(slot) => {
                self.emit_op(OpCode::SetLocal, line);
                self.chunk.append(slot as u8, line);
            }
            None => {
                self.emit_named(OpCode::SetGlobal, Value::Str(name.to_string()), line);
            }
        }
    }

    fn visit_logical(
        &mut self,
        left: &crate::expr::Expression,
        operator: &crate::token::LogicalOp,
        line: &u64,
        right: &crate::expr::Expression,
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
        callee: &crate::expr::Expression,
        args: &Vec<crate::expr::Expression>,
        paren: &crate::token::Token,
    ) -> Self::Output {
        callee.accept(self);
        for arg in args {
            arg.accept(self);
        }
        self.emit_op(OpCode::Call, paren.line);
        self.chunk.append(args.len() as u8, paren.line);
    }

    fn visit_get(
        &mut self,
        expr: &crate::expr::Expression,
        token: &crate::token::Token,
    ) -> Self::Output {
        expr.accept(self);
        self.emit_named(
            OpCode::GetProperty,
            Value::Str(token.lexeme.clone()),
            token.line,
        );
    }

    fn visit_set(
        &mut self,
        expr: &crate::expr::Expression,
        token: &crate::token::Token,
        value: &crate::expr::Expression,
    ) -> Self::Output {
        expr.accept(self);
        value.accept(self);
        self.emit_named(
            OpCode::SetProperty,
            Value::Str(token.lexeme.clone()),
            token.line,
        );
    }

    fn visit_this(&mut self, token: &crate::token::Token, id: usize) -> Self::Output {
        todo!()
    }

    fn visit_super(
        &mut self,
        key_super: &crate::token::Token,
        method: &crate::token::Token,
        id: usize,
    ) -> Self::Output {
        todo!()
    }
}

impl StmtVisitor for Compiler {
    type Output = ();

    fn visit_print(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        expr.accept(self);
        self.emit_op(OpCode::Print, 0); //todo: ver oq fazer com essa linha tb
    }

    fn visit_expr_statement(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        expr.accept(self);
        self.emit_op(OpCode::Pop, 0);
    }

    fn visit_var(
        &mut self,
        name: &String,
        expr: Option<&crate::expr::Expression>,
        line: u64,
    ) -> Self::Output {
        if let Some(e) = expr {
            e.accept(self);
        } else {
            self.emit_op(OpCode::Null, line);
        }
        if self.scope_depth > 0 {
            self.add_local(name.to_string());
        } else {
            self.emit_named(OpCode::DefineGlobal, Value::Str(name.to_string()), line);
        }
    }

    fn visit_block(&mut self, statements: &Vec<Statement>) -> Self::Output {
        self.begin_scope();
        for stmt in statements {
            stmt.accept(self);
        }
        self.end_scope();
    }

    fn visit_if(
        &mut self,
        expr: &Expression,
        stmt: &Statement,
        else_stmt: Option<&Statement>,
    ) -> Self::Output {
        expr.accept(self);
        let then_jump = self.emit_jump(OpCode::JumpIfFalse, 0);
        self.emit_op(OpCode::Pop, 0);
        stmt.accept(self);

        let else_jump = self.emit_jump(OpCode::Jump, 0);
        self.patch_jump(then_jump);
        self.emit_op(OpCode::Pop, 0);
        if let Some(e) = else_stmt {
            e.accept(self);
        }
        self.patch_jump(else_jump);
    }
    fn visit_while(&mut self, expr: &Expression, stmt: &Statement) -> Self::Output {
        let loop_start = self.chunk.code.len();
        expr.accept(self);
        let exit_jump = self.emit_jump(OpCode::JumpIfFalse, 0);
        self.emit_op(OpCode::Pop, 0);
        stmt.accept(self);
        self.emit_loop(loop_start, 0);
        self.patch_jump(exit_jump);
        self.emit_op(OpCode::Pop, 0);
    }
    fn visit_function(
        &mut self,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<Statement>,
        line: u64,
    ) {
        let function = self.compile_function(name, params, stmts);
        let value = Value::Function(Rc::new(function));
        self.emit_constant(value, line);
        if self.scope_depth > 0 {
            self.add_local(name.to_string());
        } else {
            self.emit_named(OpCode::DefineGlobal, Value::Str(name.to_string()), line);
        }
    }

    fn visit_return(&mut self, line: u64, value: Option<&crate::expr::Expression>) -> Self::Output {
        match value {
            Some(v) => v.accept(self),
            None => {
                self.emit_op(OpCode::Null, line);
            }
        }
        self.emit_op(OpCode::Return, line);
    }

    fn visit_class(
        &mut self,
        name: &String,
        line: u64,
        superclass: &Option<crate::expr::Expression>,
        attributes: &Vec<String>,
        statements: &Vec<Statement>,
    ) -> Self::Output {
        let mut methods = HashMap::new();
        for method_stmt in statements {
            if let Statement::Function(m_name, m_params, m_body, _) = method_stmt {
                let method = self.compile_function(m_name, m_params, m_body);
                methods.insert(m_name.clone(), Rc::new(method));
            }
        }
        let class = Class {
            name: name.to_string(),
            attributes: attributes.to_vec(),
            methods,
        };

        let value = Value::Class(Rc::new(class));
        self.emit_constant(value, line);
        if self.scope_depth > 0 {
            self.add_local(name.to_string());
        } else {
            self.emit_named(OpCode::DefineGlobal, Value::Str(name.to_string()), line);
        }
    }
}
