use crate::{
    chunk::{self, Chunk, opcode::OpCode},
    events::{CompileEvent, Event::Compile, SharedSink},
    expr::ExprVisitor,
    stmt::{self, Statement, StmtVisitor},
    token::{BinaryOp, TokenLiteral, UnaryOp},
    value::Value,
};

pub struct Compiler {
    chunk: Chunk,
    sink: SharedSink,
}

impl Compiler {
    pub fn new(sink: SharedSink) -> Compiler {
        Compiler {
            chunk: Chunk::new(),
            sink,
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

    pub fn compile(&mut self, statements: &Vec<Statement>) {
        for stmt in statements {
            stmt.accept(self);
        }
        self.emit_op(OpCode::Return, 0);
    }

    pub fn into_chunk(self) -> Chunk {
        self.chunk
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
        let opcode = match operator {
            BinaryOp::Plus => OpCode::Add,
            BinaryOp::Minus => OpCode::Subtract,
            BinaryOp::Star => OpCode::Multiply,
            BinaryOp::Slash => OpCode::Divide,
            _ => todo!("comparações precisam de opcodes novos na VM"),
        };
        self.emit_op(opcode, *line);
    }

    fn visit_literal(&mut self, literal: &crate::token::TokenLiteral) -> Self::Output {
        match literal {
            TokenLiteral::Number(n) => {
                self.emit_constant(Value::Number(*n), 0); // TODO: linha real do literal
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
            UnaryOp::Bang => todo!("negação lógica precisa do opcode Not"),
        };
        self.emit_op(opcode, *line);
    }

    fn visit_grouping(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        expr.accept(self);
    }

    fn visit_variable(&mut self, name: &String, line: u64, id: usize) -> Self::Output {
        todo!()
    }

    fn visit_assign(
        &mut self,
        name: &String,
        line: u64,
        expr: &crate::expr::Expression,
        id: usize,
    ) -> Self::Output {
        todo!()
    }

    fn visit_logical(
        &mut self,
        left: &crate::expr::Expression,
        operator: &crate::token::LogicalOp,
        line: &u64,
        right: &crate::expr::Expression,
    ) -> Self::Output {
        todo!()
    }

    fn visit_call(
        &mut self,
        callee: &crate::expr::Expression,
        args: &Vec<crate::expr::Expression>,
        paren: &crate::token::Token,
    ) -> Self::Output {
        todo!()
    }

    fn visit_get(
        &mut self,
        expr: &crate::expr::Expression,
        token: &crate::token::Token,
    ) -> Self::Output {
        todo!()
    }

    fn visit_set(
        &mut self,
        expr: &crate::expr::Expression,
        token: &crate::token::Token,
        value: &crate::expr::Expression,
    ) -> Self::Output {
        todo!()
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
        todo!()
    }

    fn visit_block(&mut self, statements: &Vec<Statement>) -> Self::Output {
        todo!()
    }

    fn visit_if(
        &mut self,
        expr: &crate::expr::Expression,
        stmt: &Statement,
        else_stmt: Option<&Statement>,
    ) -> Self::Output {
        todo!()
    }

    fn visit_while(&mut self, expr: &crate::expr::Expression, stmt: &Statement) -> Self::Output {
        todo!()
    }

    fn visit_function(
        &mut self,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<Statement>,
        line: u64,
    ) -> Self::Output {
        todo!()
    }

    fn visit_return(&mut self, line: u64, value: Option<&crate::expr::Expression>) -> Self::Output {
        todo!()
    }

    fn visit_class(
        &mut self,
        name: &String,
        line: u64,
        superclass: &Option<crate::expr::Expression>,
        statements: &Vec<Statement>,
    ) -> Self::Output {
        todo!()
    }
}
