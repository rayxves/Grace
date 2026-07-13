use super::{IsFunction, ResolveError, Resolver};
use crate::{
    expr::Expression,
    stmt::{Statement, StmtVisitor},
};

impl StmtVisitor for Resolver {
    type Output = Result<(), ResolveError>;

    fn visit_print(&mut self, expr: &Expression) -> Self::Output {
        expr.accept(self)?;
        Ok(())
    }
    fn visit_expr_statement(&mut self, expr: &Expression) -> Self::Output {
        expr.accept(self)?;
        Ok(())
    }

    fn visit_var(&mut self, name: &String, expr: Option<&Expression>, line: u64) -> Self::Output {
        self.declare(name.clone(), line)?;
        if let Some(e) = expr {
            e.accept(self)?;
        };
        self.define(name.clone());
        Ok(())
    }

    fn visit_block(&mut self, statements: &Vec<Statement>) -> Self::Output {
        self.begin_scope();
        for stmt in statements {
            stmt.accept(self)?;
        }
        self.end_scope();
        Ok(())
    }

    fn visit_if(
        &mut self,
        expr: &Expression,
        stmt: &Statement,
        else_stmt: Option<&Statement>,
    ) -> Self::Output {
        expr.accept(self)?;
        stmt.accept(self)?;
        if let Some(e) = else_stmt {
            e.accept(self)?;
        }
        Ok(())
    }

    fn visit_while(&mut self, expr: &Expression, stmt: &Statement) -> Self::Output {
        expr.accept(self)?;
        stmt.accept(self)?;
        Ok(())
    }

    fn visit_function(
        &mut self,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<Statement>,
        line: u64,
    ) -> Self::Output {
        self.declare(name.clone(), line)?;
        self.define(name.clone());
        self.begin_scope();
        let is_fun = self.is_function;
        self.is_function = IsFunction::Function;
        for param in params {
            self.declare(param.clone(), line)?;
            self.define(param.clone());
        }
        for stmt in stmts {
            stmt.accept(self)?;
        }
        self.is_function = is_fun;
        self.end_scope();
        Ok(())
    }

    fn visit_return(&mut self, line: u64, value: Option<&Expression>) -> Self::Output {
        if matches!(self.is_function, IsFunction::None) {
            return Err(self.error(
                "'retorna' só pode ser usado dentro de uma função.".to_string(),
                line,
            ));
        } else if matches!(self.is_function, IsFunction::Initializer) && value.is_some() {
            return Err(self.error("O método 'init' não pode retornar um valor. Use 'retorna;' sem valor para sair cedo.".to_string(), line));
        }
        if let Some(v) = value {
            v.accept(self)?;
        }
        Ok(())
    }

    fn visit_class(
        &mut self,
        name: &String,
        line: u64,
        superclass: &Option<Expression>,
        attributes: &Vec<String>,
        statements: &Vec<Statement>,
    ) -> Self::Output {
        let current_is_class = self.is_class;
        self.declare(name.clone(), line)?;
        self.define(name.clone());
        match superclass {
            Some(s) => {
                if let Expression::Variable(super_name, super_line, _) = s {
                    if super_name == name {
                        return Err(self.error(
                            format!("A classe '{}' não pode herdar de si mesma.", name),
                            *super_line,
                        ));
                    }
                }
                self.is_class = super::IsClass::Subclass;
                s.accept(self)?;
                self.begin_scope();
                if let Some(scope) = self.scopes.last_mut() {
                    scope.insert("super".to_string(), true);
                }
            }
            None => {
                self.is_class = super::IsClass::Class;
            }
        };
        self.begin_scope();
        if let Some(scope) = self.scopes.last_mut() {
            scope.insert("this".to_string(), true);
        }
        for atributo in attributes {
            self.declare(atributo.clone(), line)?;
            self.define(atributo.clone());
        }
        for stmt in statements {
            if let Statement::Function(n, params, body, _line) = stmt {
                let prev_fn = self.is_function;
                self.is_function = if n == "init" {
                    IsFunction::Initializer
                } else {
                    IsFunction::Function
                };
                self.begin_scope();
                for param in params {
                    self.declare(param.clone(), line)?;
                    self.define(param.clone());
                }
                self.resolve(body)?;
                self.end_scope();
                self.is_function = prev_fn;
            }
        }
        self.end_scope();
        if superclass.is_some() {
            self.end_scope();
        }
        self.is_class = current_is_class;
        Ok(())
    }
}
