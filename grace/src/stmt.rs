use crate::expr::Expression;

pub trait StmtVisitor {
    type Output;
    fn visit_print(&mut self, expr: &Expression, line: u64) -> Self::Output;
    fn visit_expr_statement(&mut self, expr: &Expression, line: u64) -> Self::Output;
    fn visit_var(&mut self, name: &String, expr: Option<&Expression>, line: u64) -> Self::Output;
    fn visit_block(&mut self, statements: &Vec<Statement>, line: u64) -> Self::Output;
    fn visit_if(
        &mut self,
        expr: &Expression,
        stmt: &Statement,
        else_stmt: Option<&Statement>,
        line: u64,
    ) -> Self::Output;
    fn visit_while(&mut self, expr: &Expression, stmt: &Statement, line: u64) -> Self::Output;
    fn visit_function(
        &mut self,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<Statement>,
        line: u64,
    ) -> Self::Output;
    fn visit_return(&mut self, line: u64, value: Option<&Expression>) -> Self::Output;
    fn visit_class(
        &mut self,
        name: &String,
        line: u64,
        superclass: &Option<Expression>,
        attributes: &Vec<String>,
        statements: &Vec<Statement>,
    ) -> Self::Output;
}

#[derive(Debug, Clone, PartialEq)]
pub enum Statement {
    Print(Expression, u64),
    ExprStatement(Expression, u64),
    Var(String, Option<Expression>, u64),
    Block(Vec<Statement>, u64),
    If(Expression, Box<Statement>, Option<Box<Statement>>, u64),
    While(Expression, Box<Statement>, u64),
    Function(String, Vec<String>, Vec<Statement>, u64),
    Return(u64, Option<Expression>),
    Class(String, u64, Option<Expression>, Vec<String>, Vec<Statement>),
}

impl Statement {
    pub fn line(&self) -> u64 {
        match self {
            Statement::Print(_, line) => *line,
            Statement::ExprStatement(_, line) => *line,
            Statement::Var(_, _, line) => *line,
            Statement::Block(_, line) => *line,
            Statement::If(_, _, _, line) => *line,
            Statement::While(_, _, line) => *line,
            Statement::Function(_, _, _, line) => *line,
            Statement::Return(line, _) => *line,
            Statement::Class(_, line, _, _, _) => *line,
        }
    }

    pub fn accept<V: StmtVisitor>(&self, visitor: &mut V) -> V::Output {
        match self {
            Statement::ExprStatement(expr, line) => visitor.visit_expr_statement(expr, *line),
            Statement::Print(expr, line) => visitor.visit_print(expr, *line),
            Statement::Var(name, expr, line) => visitor.visit_var(name, expr.as_ref(), *line),
            Statement::Block(statements, line) => visitor.visit_block(statements, *line),
            Statement::If(expr, stmt, else_stmt, line) => {
                visitor.visit_if(expr, stmt, else_stmt.as_deref(), *line)
            }
            Statement::While(expr, stmt, line) => visitor.visit_while(expr, stmt, *line),
            Statement::Function(name, params, stmts, line) => {
                visitor.visit_function(name, params, stmts, *line)
            }
            Statement::Return(line, value) => visitor.visit_return(*line, value.as_ref()),
            Statement::Class(name, line, superclass, attributes, statements) => {
                visitor.visit_class(name, *line, superclass, attributes, statements)
            }
        }
    }
}