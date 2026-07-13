use std::vec;

use crate::{expr::ExprVisitor, stmt::StmtVisitor};

pub struct AstNode {
    pub id: Option<usize>,
    pub kind: String,
    pub label: String,
    pub line: Option<u64>,
    pub children: Vec<AstNode>,
}

pub struct AstSerializer;

impl ExprVisitor for AstSerializer {
    type Output = AstNode;

    fn visit_binary(
        &mut self,
        left: &crate::expr::Expression,
        operator: &crate::token::BinaryOp,
        line: &u64,
        right: &crate::expr::Expression,
    ) -> Self::Output {
        AstNode {
            id: None,
            kind: "Binary".to_string(),
            label: format!("{:?}", operator),
            line: Some(*line),
            children: vec![left.accept(self), right.accept(self)],
        }
    }

    fn visit_literal(&mut self, literal: &crate::token::TokenLiteral) -> Self::Output {
        AstNode {
            id: None,
            kind: "Literal".to_string(),
            label: format!("{:?}", literal),
            line: None,
            children: vec![],
        }
    }

    fn visit_unary(
        &mut self,
        unary_op: &crate::token::UnaryOp,
        line: &u64,
        expr: &crate::expr::Expression,
    ) -> Self::Output {
        AstNode {
            id: None,
            kind: "Unary".to_string(),
            label: format!("{:?}", unary_op),
            line: Some(*line),
            children: vec![expr.accept(self)],
        }
    }

    fn visit_grouping(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        AstNode {
            id: None,
            kind: "Grouping".to_string(),
            label: "".to_string(),
            line: None,
            children: vec![expr.accept(self)],
        }
    }

    fn visit_variable(&mut self, name: &String, line: u64, id: usize) -> Self::Output {
        AstNode {
            id: Some(id),
            kind: "Variable".to_string(),
            label: name.to_string(),
            line: Some(line),
            children: vec![],
        }
    }

    fn visit_assign(
        &mut self,
        name: &String,
        line: u64,
        expr: &crate::expr::Expression,
        id: usize,
    ) -> Self::Output {
        AstNode {
            id: Some(id),
            kind: "Assign".to_string(),
            label: name.to_string(),
            line: Some(line),
            children: vec![expr.accept(self)],
        }
    }

    fn visit_logical(
        &mut self,
        left: &crate::expr::Expression,
        operator: &crate::token::LogicalOp,
        line: &u64,
        right: &crate::expr::Expression,
    ) -> Self::Output {
        AstNode {
            id: None,
            kind: "Logical".to_string(),
            label: format!("{:?}", operator),
            line: Some(*line),
            children: vec![left.accept(self), right.accept(self)],
        }
    }

    fn visit_call(
        &mut self,
        callee: &crate::expr::Expression,
        args: &Vec<crate::expr::Expression>,
        paren: &crate::token::Token,
    ) -> Self::Output {
        let mut children = vec![callee.accept(self)];
        for arg in args {
            children.push(arg.accept(self));
        }
        AstNode {
            id: None,
            kind: "Call".to_string(),
            label: "".to_string(),
            line: Some(paren.line),
            children,
        }
    }

    fn visit_get(
        &mut self,
        expr: &crate::expr::Expression,
        token: &crate::token::Token,
    ) -> Self::Output {
        AstNode {
            id: None,
            kind: "Get".to_string(),
            label: token.lexeme.to_string(),
            line: Some(token.line),
            children: vec![expr.accept(self)],
        }
    }

    fn visit_set(
        &mut self,
        expr: &crate::expr::Expression,
        token: &crate::token::Token,
        value: &crate::expr::Expression,
    ) -> Self::Output {
        AstNode {
            id: None,
            kind: "Set".to_string(),
            label: token.lexeme.to_string(),
            line: Some(token.line),
            children: vec![expr.accept(self), value.accept(self)],
        }
    }

    fn visit_this(&mut self, token: &crate::token::Token, id: usize) -> Self::Output {
        AstNode {
            id: Some(id),
            kind: "This".to_string(),
            label: token.lexeme.to_string(),
            line: Some(token.line),
            children: vec![],
        }
    }

    fn visit_super(
        &mut self,
        key_super: &crate::token::Token,
        method: &crate::token::Token,
        id: usize,
    ) -> Self::Output {
        AstNode {
            id: Some(id),
            kind: "Super".to_string(),
            label: method.lexeme.to_string(),
            line: Some(key_super.line),
            children: vec![],
        }
    }
}

impl StmtVisitor for AstSerializer {
    type Output = AstNode;

    fn visit_print(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        AstNode {
            id: None,
            kind: "Print".to_string(),
            label: "".to_string(),
            line: None,
            children: vec![expr.accept(self)],
        }
    }

    fn visit_expr_statement(&mut self, expr: &crate::expr::Expression) -> Self::Output {
        AstNode {
            id: None,
            kind: "ExprStmt".to_string(),
            label: "".to_string(),
            line: None,
            children: vec![expr.accept(self)],
        }
    }

    fn visit_var(
        &mut self,
        name: &String,
        expr: Option<&crate::expr::Expression>,
        line: u64,
    ) -> Self::Output {
        let children = match expr {
            Some(e) => {
                vec![e.accept(self)]
            }
            None => {
                vec![]
            }
        };
        AstNode {
            id: None,
            kind: "VarDecl".to_string(),
            label: name.to_string(),
            line: Some(line),
            children,
        }
    }

    fn visit_block(&mut self, statements: &Vec<crate::stmt::Statement>) -> Self::Output {
        let mut children = vec![];
        for stmt in statements {
            children.push(stmt.accept(self));
        }

        AstNode {
            id: None,
            kind: "Block".to_string(),
            label: "".to_string(),
            line: None,
            children,
        }
    }

    fn visit_if(
        &mut self,
        expr: &crate::expr::Expression,
        stmt: &crate::stmt::Statement,
        else_stmt: Option<&crate::stmt::Statement>,
    ) -> Self::Output {
        let mut children = vec![expr.accept(self), stmt.accept(self)];
        if let Some(e) = else_stmt {
            children.push(e.accept(self));
        }
        AstNode {
            id: None,
            kind: "If".to_string(),
            label: "".to_string(),
            line: None,
            children,
        }
    }

    fn visit_while(
        &mut self,
        expr: &crate::expr::Expression,
        stmt: &crate::stmt::Statement,
    ) -> Self::Output {
        AstNode {
            id: None,
            kind: "While".to_string(),
            label: "".to_string(),
            line: None,
            children: vec![expr.accept(self), stmt.accept(self)],
        }
    }

    fn visit_function(
        &mut self,
        name: &String,
        params: &Vec<String>,
        stmts: &Vec<crate::stmt::Statement>,
        line: u64,
    ) -> Self::Output {
        let mut children = vec![];
        for stmt in stmts {
            children.push(stmt.accept(self));
        }
        AstNode {
            id: None,
            kind: "Function".to_string(),
            label: format!("{}({})", name, params.join(", ")),
            line: Some(line),
            children,
        }
    }

    fn visit_return(&mut self, line: u64, value: Option<&crate::expr::Expression>) -> Self::Output {
        let children = match value {
            Some(e) => {
                vec![e.accept(self)]
            }
            None => {
                vec![]
            }
        };
        AstNode {
            id: None,
            kind: "Return".to_string(),
            label: "".to_string(),
            line: Some(line),
            children,
        }
    }

    fn visit_class(
        &mut self,
        name: &String,
        line: u64,
        superclass: &Option<crate::expr::Expression>,
        attributes: &Vec<String>,
        statements: &Vec<crate::stmt::Statement>,
    ) -> Self::Output {
        let mut children = vec![];
        if let Some(sc) = superclass {
            children.push(sc.accept(self));
        }
        for atributo in attributes {
            children.push(AstNode {
                id: None,
                kind: "Attribute".to_string(),
                label: atributo.clone(),
                line: Some(line),
                children: vec![],
            });
        }
        for s in statements {
            children.push(s.accept(self));
        }

        AstNode {
            id: None,
            kind: "Class".to_string(),
            label: name.clone(),
            line: Some(line),
            children,
        }
    }
}
