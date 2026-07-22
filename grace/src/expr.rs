use crate::token::{BinaryOp, LogicalOp, Token, TokenLiteral, UnaryOp};
use std::sync::atomic::{AtomicUsize, Ordering};

static NEXT_ID: AtomicUsize = AtomicUsize::new(0);

pub fn next_id() -> usize {
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}

pub trait ExprVisitor {
    type Output;
    fn visit_binary(
        &mut self,
        id: usize,
        left: &Expression,
        operator: &BinaryOp,
        line: &u64,
        right: &Expression,
    ) -> Self::Output;
    fn visit_literal(&mut self, id: usize, literal: &TokenLiteral, line: u64) -> Self::Output;
    fn visit_unary(
        &mut self,
        id: usize,
        unary_op: &UnaryOp,
        line: &u64,
        expr: &Expression,
    ) -> Self::Output;
    fn visit_grouping(&mut self, id: usize, expr: &Expression) -> Self::Output;
    fn visit_variable(&mut self, name: &String, line: u64, id: usize) -> Self::Output;
    fn visit_assign(
        &mut self,
        name: &String,
        line: u64,
        expr: &Expression,
        id: usize,
    ) -> Self::Output;
    fn visit_logical(
        &mut self,
        id: usize,
        left: &Expression,
        operator: &LogicalOp,
        line: &u64,
        right: &Expression,
    ) -> Self::Output;
    fn visit_call(
        &mut self,
        id: usize,
        callee: &Expression,
        args: &Vec<Expression>,
        paren: &Token,
    ) -> Self::Output;
    fn visit_get(&mut self, id: usize, expr: &Expression, token: &Token) -> Self::Output;
    fn visit_set(
        &mut self,
        id: usize,
        expr: &Expression,
        token: &Token,
        value: &Expression,
    ) -> Self::Output;
    fn visit_this(&mut self, token: &Token, id: usize) -> Self::Output;
    fn visit_super(&mut self, key_super: &Token, method: &Token, id: usize) -> Self::Output;
}

#[derive(Debug, PartialEq, Clone)]
pub enum Expression {
    Binary(Box<Expression>, BinaryOp, u64, Box<Expression>, usize),
    Unary(UnaryOp, u64, Box<Expression>, usize),
    Grouping(Box<Expression>, usize),
    Literal(TokenLiteral, u64, usize),
    Variable(String, u64, usize),
    Assign(String, u64, Box<Expression>, usize),
    Logical(Box<Expression>, LogicalOp, u64, Box<Expression>, usize),
    Call(Box<Expression>, Vec<Expression>, Token, usize),
    Get(Box<Expression>, Token, usize),
    Set(Box<Expression>, Token, Box<Expression>, usize),
    This(Token, usize),
    Super(Token, Token, usize),
}

impl Expression {
    pub fn line(&self) -> u64 {
        match self {
            Expression::Binary(_, _, line, _, ..) => *line,
            Expression::Unary(_, line, _, ..) => *line,
            Expression::Grouping(expr, ..) => expr.line(),
            Expression::Literal(_, line, ..) => *line,
            Expression::Variable(_, line, _) => *line,
            Expression::Assign(_, line, _, _) => *line,
            Expression::Logical(_, _, line, _, ..) => *line,
            Expression::Call(_, _, paren, ..) => paren.line,
            Expression::Get(_, token, ..) => token.line,
            Expression::Set(_, token, _, ..) => token.line,
            Expression::This(token, _) => token.line,
            Expression::Super(key_super, _, _) => key_super.line,
        }
    }

    pub fn id(&self) -> usize {
        match self {
            Expression::Binary(_, _, _, _, id) => *id,
            Expression::Unary(_, _, _, id) => *id,
            Expression::Grouping(_, id) => *id,
            Expression::Literal(_, _, id) => *id,
            Expression::Variable(_, _, id) => *id,
            Expression::Assign(_, _, _, id) => *id,
            Expression::Logical(_, _, _, _, id) => *id,
            Expression::Call(_, _, _, id) => *id,
            Expression::Get(_, _, id) => *id,
            Expression::Set(_, _, _, id) => *id,
            Expression::This(_, id) => *id,
            Expression::Super(_, _, id) => *id,
        }
    }

    pub fn accept<V: ExprVisitor>(&self, visitor: &mut V) -> V::Output {
        match self {
            Expression::Binary(left, op, line, right, id) => {
                visitor.visit_binary(*id, left, op, line, right)
            }
            Expression::Literal(literal, line, id) => visitor.visit_literal(*id, literal, *line),
            Expression::Grouping(expr, id) => visitor.visit_grouping(*id, expr),
            Expression::Unary(unary_op, line, expr, id) => {
                visitor.visit_unary(*id, unary_op, line, expr)
            }
            Expression::Variable(name, line, id) => visitor.visit_variable(name, *line, *id),
            Expression::Assign(name, line, expr, id) => {
                visitor.visit_assign(name, *line, expr, *id)
            }
            Expression::Logical(left, logical_op, line, right, id) => {
                visitor.visit_logical(*id, left, logical_op, line, right)
            }
            Expression::Call(callee, args, paren, id) => {
                visitor.visit_call(*id, callee, args, paren)
            }
            Expression::Get(expr, token, id) => visitor.visit_get(*id, expr, token),
            Expression::Set(expr, token, value, id) => visitor.visit_set(*id, expr, token, value),
            Expression::This(token, id) => visitor.visit_this(token, *id),
            Expression::Super(key_super, method, id) => visitor.visit_super(key_super, method, *id),
        }
    }
}
