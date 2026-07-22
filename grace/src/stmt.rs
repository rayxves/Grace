use crate::expr::Expression;

pub trait StmtVisitor {
    type Output;
    fn visit_print(&mut self, id: usize, expr: &Expression, line: u64) -> Self::Output;
    fn visit_expr_statement(&mut self, id: usize, expr: &Expression, line: u64) -> Self::Output;
    fn visit_var(
        &mut self,
        id: usize,
        name: &String,
        expr: Option<&Expression>,
        line: u64,
    ) -> Self::Output;
    fn visit_block(&mut self, id: usize, statements: &Vec<Statement>, line: u64) -> Self::Output;
    fn visit_if(
        &mut self,
        id: usize,
        expr: &Expression,
        stmt: &Statement,
        else_stmt: Option<&Statement>,
        line: u64,
    ) -> Self::Output;
    fn visit_while(
        &mut self,
        id: usize,
        expr: &Expression,
        stmt: &Statement,
        line: u64,
    ) -> Self::Output;
    fn visit_function(
        &mut self,
        id: usize,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<Statement>,
        line: u64,
    ) -> Self::Output;
    fn visit_return(&mut self, id: usize, line: u64, value: Option<&Expression>) -> Self::Output;
    fn visit_class(
        &mut self,
        id: usize,
        name: &String,
        line: u64,
        superclass: &Option<Expression>,
        attributes: &Vec<String>,
        statements: &Vec<Statement>,
    ) -> Self::Output;
}

#[derive(Debug, Clone, PartialEq)]
pub enum Statement {
    Print(Expression, u64, usize),
    ExprStatement(Expression, u64, usize),
    Var(String, Option<Expression>, u64, usize),
    Block(Vec<Statement>, u64, usize),
    If(Expression, Box<Statement>, Option<Box<Statement>>, u64, usize),
    While(Expression, Box<Statement>, u64, usize),
    Function(String, Vec<String>, Vec<Statement>, u64, usize),
    Return(u64, Option<Expression>, usize),
    Class(
        String,
        u64,
        Option<Expression>,
        Vec<String>,
        Vec<Statement>,
        usize,
    ),
}

impl Statement {
    pub fn line(&self) -> u64 {
        match self {
            Statement::Print(_, line, ..) => *line,
            Statement::ExprStatement(_, line, ..) => *line,
            Statement::Var(_, _, line, ..) => *line,
            Statement::Block(_, line, ..) => *line,
            Statement::If(_, _, _, line, ..) => *line,
            Statement::While(_, _, line, ..) => *line,
            Statement::Function(_, _, _, line, ..) => *line,
            Statement::Return(line, ..) => *line,
            Statement::Class(_, line, ..) => *line,
        }
    }

    pub fn accept<V: StmtVisitor>(&self, visitor: &mut V) -> V::Output {
        match self {
            Statement::ExprStatement(expr, line, id) => {
                visitor.visit_expr_statement(*id, expr, *line)
            }
            Statement::Print(expr, line, id) => visitor.visit_print(*id, expr, *line),
            Statement::Var(name, expr, line, id) => {
                visitor.visit_var(*id, name, expr.as_ref(), *line)
            }
            Statement::Block(statements, line, id) => visitor.visit_block(*id, statements, *line),
            Statement::If(expr, stmt, else_stmt, line, id) => {
                visitor.visit_if(*id, expr, stmt, else_stmt.as_deref(), *line)
            }
            Statement::While(expr, stmt, line, id) => visitor.visit_while(*id, expr, stmt, *line),
            Statement::Function(name, params, stmts, line, id) => {
                visitor.visit_function(*id, name, params, stmts, *line)
            }
            Statement::Return(line, value, id) => visitor.visit_return(*id, *line, value.as_ref()),
            Statement::Class(name, line, superclass, attributes, statements, id) => {
                visitor.visit_class(*id, name, *line, superclass, attributes, statements)
            }
        }
    }
}
