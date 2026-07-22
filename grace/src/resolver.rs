mod statements;
use crate::{
    events::{Event::Resolve, ResolveEvent, SharedSink},
    expr::{ExprVisitor, Expression},
    token::Token,
};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct ResolveError {
    pub line: u64,
    pub message: String,
}
impl ResolveError {
    pub fn new(line: u64, message: String) -> ResolveError {
        ResolveError { line, message }
    }
}

pub struct Resolver {
    scopes: Vec<HashMap<String, bool>>,
    is_function: IsFunction,
    is_class: IsClass,
    locals: HashMap<usize, usize>,
    sink: SharedSink,
    pub errors: Vec<ResolveError>,
}
#[derive(Clone, Copy)]
pub enum IsFunction {
    Function,
    Initializer,
    None,
}
#[derive(Clone, Copy, PartialEq)]
pub enum IsClass {
    Class,
    Subclass,
    None,
}

impl Resolver {
    pub fn new(sink: SharedSink) -> Resolver {
        Resolver {
            scopes: Vec::new(),
            is_function: IsFunction::None,
            is_class: IsClass::None,
            locals: HashMap::new(),
            sink,
            errors: Vec::new(),
        }
    }
    pub fn begin_scope(&mut self) {
        self.scopes.push(HashMap::new());
        self.sink
            .borrow_mut()
            .emit(Resolve(ResolveEvent::ScopeBegin));
    }
    pub fn end_scope(&mut self) {
        self.scopes.pop();
        self.sink.borrow_mut().emit(Resolve(ResolveEvent::ScopeEnd));
    }
    pub fn declare(&mut self, name: String, line: u64) -> Result<(), ResolveError> {
        if self.scopes.is_empty() {
            return Ok(());
        }
        if self.scopes.last().unwrap().contains_key(&name) {
            return Err(self.error(
                format!(
                    "Variável '{}' já foi declarada neste escopo. Use um nome diferente.",
                    name
                ),
                line,
            ));
        }
        self.scopes.last_mut().unwrap().insert(name.clone(), false);
        self.sink
            .borrow_mut()
            .emit(Resolve(ResolveEvent::Declare { name, line }));
        Ok(())
    }
    pub fn define(&mut self, name: String) {
        if let Some(scope) = self.scopes.last_mut() {
            scope.insert(name.clone(), true);
            self.sink
                .borrow_mut()
                .emit(Resolve(ResolveEvent::Define { name }));
        }
    }
    pub fn resolve_local(&mut self, id: usize, name: &str) {
        for i in (0..self.scopes.len()).rev() {
            if self.scopes[i].contains_key(name) {
                let depth = self.scopes.len() - 1 - i;
                self.locals.insert(id, depth);
                self.sink.borrow_mut().emit(Resolve(ResolveEvent::Resolve {
                    id,
                    name: name.to_string(),
                    depth,
                }));
                return;
            }
        }
    }
    pub fn into_locals(self) -> HashMap<usize, usize> {
        self.locals
    }
    pub fn resolve(
        &mut self,
        statements: &Vec<crate::stmt::Statement>,
    ) -> Result<(), ResolveError> {
        for stmt in statements {
            stmt.accept(self)?;
        }
        Ok(())
    }
    pub fn error(&mut self, message: String, line: u64) -> ResolveError {
        let error = ResolveError::new(line, message.clone());
        self.errors.push(error.clone());
        self.sink
            .borrow_mut()
            .emit(Resolve(ResolveEvent::Error { message, line }));
        error
    }
}

impl ExprVisitor for Resolver {
    type Output = Result<(), ResolveError>;
    fn visit_binary(
        &mut self,
        _id: usize,
        left: &Expression,
        _o: &crate::token::BinaryOp,
        _l: &u64,
        right: &Expression,
    ) -> Self::Output {
        left.accept(self)?;
        right.accept(self)?;
        Ok(())
    }
    fn visit_literal(
        &mut self,
        _id: usize,
        _literal: &crate::token::TokenLiteral,
        _line: u64,
    ) -> Self::Output {
        Ok(())
    }
    fn visit_unary(
        &mut self,
        _id: usize,
        _u: &crate::token::UnaryOp,
        _l: &u64,
        expr: &Expression,
    ) -> Self::Output {
        expr.accept(self)?;
        Ok(())
    }
    fn visit_grouping(&mut self, _id: usize, expr: &Expression) -> Self::Output {
        expr.accept(self)?;
        Ok(())
    }
    fn visit_variable(&mut self, name: &String, line: u64, id: usize) -> Self::Output {
        if !self.scopes.is_empty() && self.scopes.last().unwrap().get(name) == Some(&false) {
            return Err(self.error(
                format!("Variável '{}' usada antes de ser inicializada.", name),
                line,
            ));
        }
        self.resolve_local(id, name);
        Ok(())
    }
    fn visit_assign(
        &mut self,
        name: &String,
        _line: u64,
        expr: &Expression,
        id: usize,
    ) -> Self::Output {
        expr.accept(self)?;
        self.resolve_local(id, name);
        Ok(())
    }
    fn visit_logical(
        &mut self,
        _id: usize,
        left: &Expression,
        _o: &crate::token::LogicalOp,
        _l: &u64,
        right: &Expression,
    ) -> Self::Output {
        left.accept(self)?;
        right.accept(self)?;
        Ok(())
    }
    fn visit_call(
        &mut self,
        _id: usize,
        callee: &Expression,
        args: &Vec<Expression>,
        _p: &Token,
    ) -> Self::Output {
        callee.accept(self)?;
        for arg in args {
            arg.accept(self)?;
        }
        Ok(())
    }
    fn visit_get(&mut self, _id: usize, expr: &Expression, _t: &Token) -> Self::Output {
        expr.accept(self)?;
        Ok(())
    }
    fn visit_set(
        &mut self,
        _id: usize,
        expr: &Expression,
        _t: &Token,
        value: &Expression,
    ) -> Self::Output {
        expr.accept(self)?;
        value.accept(self)?;
        Ok(())
    }
    fn visit_this(&mut self, token: &Token, id: usize) -> Self::Output {
        if self.is_class == IsClass::None {
            return Err(self.error(
                "'este' só pode ser usado dentro de métodos de uma classe.".to_string(),
                token.line,
            ));
        }
        self.resolve_local(id, "this");
        Ok(())
    }
    fn visit_super(&mut self, key_super: &Token, _m: &Token, id: usize) -> Self::Output {
        if self.is_class == IsClass::None {
            return Err(self.error(
                "'super' só pode ser usado dentro de métodos de uma classe.".to_string(),
                key_super.line,
            ));
        } else if self.is_class == IsClass::Class {
            return Err(self.error(
                "'super' só pode ser usado em classes que herdam de outra classe.".to_string(),
                key_super.line,
            ));
        }
        self.resolve_local(id, "super");
        Ok(())
    }
}
