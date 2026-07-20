pub mod function;
use std::{cell::RefCell, collections::HashMap, rc::Rc};

use crate::value::function::Function;

#[derive(Debug, Clone)]
pub struct Class {
    pub name: String,
    pub attributes: Vec<String>,
    pub methods: HashMap<String, Rc<Function>>,
    pub superclass: Option<Rc<Class>>
}

#[derive(Debug, Clone)]
pub struct Instance {
    pub class: Rc<Class>,
    pub fields: HashMap<String, Value>,
}

#[derive(Debug, Clone)]
pub struct BoundMethod {
    pub receiver: Rc<RefCell<Instance>>,
    pub method: Rc<Function>,
}

#[derive(Debug, Clone)]
pub enum Value {
    Number(f64),
    Str(String),
    Bool(bool),
    Function(Rc<Function>),
    Class(Rc<Class>),
    Instance(Rc<RefCell<Instance>>),
    BoundMethod(Rc<BoundMethod>),
    Null,
}

impl Value {
    pub fn to_display(&self) -> String {
        match self {
            Value::Number(n) => {
                if *n == n.floor() {
                    format!("{}", *n as i64)
                } else {
                    format!("{}", n)
                }
            }
            Value::Str(s) => s.to_string(),
            Value::Bool(b) => {
                if *b {
                    "Verdadeiro".to_string()
                } else {
                    "Falso".to_string()
                }
            }
            Value::Function(f) => format!("Função {}", f.name),
            Value::Class(c) => format!("Classe {}", c.name),
            Value::Instance(i) => format!("Instância {}", i.borrow().class.name),
            Value::BoundMethod(b) => format!(
                "Método {} de {}",
                b.method.name,
                b.receiver.borrow().class.name
            ),
            Value::Null => "Nulo".to_string(),
        }
    }
}

impl PartialEq for Value {
    fn eq(&self, other: &Value) -> bool {
        match (self, other) {
            (Value::Number(a), Value::Number(b)) => a == b,
            (Value::Str(a), Value::Str(b)) => a == b,
            (Value::Bool(a), Value::Bool(b)) => a == b,
            (Value::Null, Value::Null) => true,
            (Value::Function(a), Value::Function(b)) => Rc::ptr_eq(a, b),
            (Value::Class(a), Value::Class(b)) => Rc::ptr_eq(a, b),
            (Value::Instance(a), Value::Instance(b)) => Rc::ptr_eq(a, b),
            (Value::BoundMethod(a), Value::BoundMethod(b)) => Rc::ptr_eq(a, b),
            _ => false,
        }
    }
}
