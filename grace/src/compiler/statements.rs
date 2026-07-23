use std::{collections::HashMap, rc::Rc};

use super::Compiler;
use crate::{
    chunk::{LoopRange, opcode::OpCode},
    expr::Expression,
    stmt::{Statement, StmtVisitor},
    value::{Class, Value},
};

impl StmtVisitor for Compiler {
    type Output = ();

    fn visit_print(&mut self, id: usize, expr: &Expression, line: u64) -> Self::Output {
        let _guard = self.enter_node(id, "Print", Some(line));
        expr.accept(self);
        self.emit_op(OpCode::Print, line, Some(id));
    }

    fn visit_expr_statement(&mut self, id: usize, expr: &Expression, line: u64) -> Self::Output {
        let _guard = self.enter_node(id, "ExprStmt", Some(line));
        expr.accept(self);
        self.emit_op(OpCode::Pop, line, Some(id));
    }

    fn visit_var(
        &mut self,
        id: usize,
        name: &String,
        expr: Option<&Expression>,
        line: u64,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "VarDecl", Some(line));
        if let Some(e) = expr {
            e.accept(self);
        } else {
            self.emit_op(OpCode::Null, line, Some(id));
        }
        if self.scope_depth > 0 {
            self.add_local(name.to_string());
        } else {
            self.emit_named(OpCode::DefineGlobal, Value::Str(name.to_string()), line, Some(id));
        }
    }

    fn visit_block(&mut self, id: usize, statements: &Vec<Statement>, line: u64) -> Self::Output {
        let _guard = self.enter_node(id, "Block", Some(line));
        self.begin_scope();
        for stmt in statements {
            stmt.accept(self);
        }
        let end_line = statements.last().map(|s| s.line()).unwrap_or(line);
        self.end_scope(end_line, Some(id));
    }

    fn visit_if(
        &mut self,
        id: usize,
        expr: &Expression,
        stmt: &Statement,
        else_stmt: Option<&Statement>,
        line: u64,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "If", Some(line));
        expr.accept(self);
        let then_jump = self.emit_jump(OpCode::JumpIfFalse, line, Some(id));
        self.emit_op(OpCode::Pop, line, Some(id));
        stmt.accept(self);

        let else_jump = self.emit_jump(OpCode::Jump, line, Some(id));
        self.patch_jump(then_jump);
        self.emit_op(OpCode::Pop, line, Some(id));
        if let Some(e) = else_stmt {
            e.accept(self);
        }
        self.patch_jump(else_jump);
    }

    fn visit_while(
        &mut self,
        id: usize,
        expr: &Expression,
        stmt: &Statement,
        line: u64,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "While", Some(line));
        let loop_start = self.chunk.code.len();
        expr.accept(self);
        let exit_jump = self.emit_jump(OpCode::JumpIfFalse, line, Some(id));
        self.emit_op(OpCode::Pop, line, Some(id));
        stmt.accept(self);
        self.emit_loop(loop_start, line, Some(id));
        self.patch_jump(exit_jump);
        self.emit_op(OpCode::Pop, line, Some(id));
        let loop_end = self.chunk.code.len();
        self.chunk.loops.push(LoopRange {
            node_id: id,
            start: loop_start,
            end: loop_end,
        });
    }

    fn visit_function(
        &mut self,
        id: usize,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<Statement>,
        line: u64,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Function", Some(line));
        let function = self.compile_function(name, params, stmts, line);
        self.emit_constant(Value::Function(Rc::new(function)), line, Some(id));
        if self.scope_depth > 0 {
            self.add_local(name.to_string());
        } else {
            self.emit_named(OpCode::DefineGlobal, Value::Str(name.to_string()), line, Some(id));
        }
    }

    fn visit_return(&mut self, id: usize, line: u64, value: Option<&Expression>) -> Self::Output {
        let _guard = self.enter_node(id, "Return", Some(line));
        match value {
            Some(v) => v.accept(self),
            None => self.emit_op(OpCode::Null, line, Some(id)),
        }
        self.emit_op(OpCode::Return, line, Some(id));
    }

    fn visit_class(
        &mut self,
        id: usize,
        name: &String,
        line: u64,
        superclass: &Option<Expression>,
        attributes: &Vec<String>,
        statements: &Vec<Statement>,
    ) -> Self::Output {
        let _guard = self.enter_node(id, "Class", Some(line));
        let parent = self.resolve_superclass(superclass, line);
        if superclass.is_some() && parent.is_none() {
            return;
        }

        let all_attributes = self.merge_attributes(&parent, attributes, line);
        let methods = self.compile_methods(name, &parent, &all_attributes, statements);

        let class = Rc::new(Class {
            name: name.to_string(),
            attributes: all_attributes,
            methods,
            superclass: parent,
        });
        self.classes.insert(name.clone(), class.clone());

        self.emit_constant(Value::Class(class), line, Some(id));
        if self.scope_depth > 0 {
            self.add_local(name.to_string());
        } else {
            self.emit_named(OpCode::DefineGlobal, Value::Str(name.to_string()), line, Some(id));
        }
    }
}

impl Compiler {
    fn resolve_superclass(
        &mut self,
        superclass: &Option<Expression>,
        line: u64,
    ) -> Option<Rc<Class>> {
        match superclass {
            Some(Expression::Variable(parent_name, _, _)) => match self.classes.get(parent_name) {
                Some(parent) => Some(parent.clone()),
                None => {
                    let message = format!(
                        "A superclasse '{}' não foi declarada. Declare a classe '{}' antes de herdar dela.",
                        parent_name, parent_name
                    );
                    self.error(message, line);
                    None
                }
            },
            _ => None,
        }
    }

    fn merge_attributes(
        &mut self,
        parent: &Option<Rc<Class>>,
        attributes: &Vec<String>,
        line: u64,
    ) -> Vec<String> {
        let mut all_attributes: Vec<String> = Vec::new();
        if let Some(p) = parent {
            all_attributes.extend(p.attributes.clone());
        }
        for attribute in attributes {
            if all_attributes.contains(attribute) {
                let parent_name = parent
                    .as_ref()
                    .map(|p| p.name.clone())
                    .unwrap_or_else(|| "?".to_string());
                let message = format!(
                    "O atributo '{}' já foi declarado na superclasse '{}'. \
                     Toda instância já vai ter esse atributo por herança, então não o declare de novo.",
                    attribute, parent_name
                );
                self.error(message, line);
            } else {
                all_attributes.push(attribute.clone());
            }
        }
        all_attributes
    }

    fn compile_methods(
        &mut self,
        name: &String,
        parent: &Option<Rc<Class>>,
        all_attributes: &[String],
        statements: &Vec<Statement>,
    ) -> HashMap<String, Rc<crate::value::function::Function>> {
        let mut methods = HashMap::new();

        if let Some(p) = parent {
            for (m_name, m) in &p.methods {
                if m_name == "construtor" {
                    continue;
                }
                methods.insert(m_name.clone(), m.clone());
            }
        }

        let enclosing = self.current_class.take();
        self.current_class = Some(Rc::new(Class {
            name: name.to_string(),
            attributes: all_attributes.to_vec(),
            methods: HashMap::new(),
            superclass: parent.clone(),
        }));

        for method_stmt in statements {
            if let Statement::Function(m_name, m_params, m_body, m_line, _id) = method_stmt {
                let method = self.compile_function(m_name, m_params, m_body, *m_line);
                methods.insert(m_name.clone(), Rc::new(method));
            }
        }

        self.current_class = enclosing;
        methods
    }
}
