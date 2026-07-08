pub mod function;
use std::rc::Rc;

use crate::value::function::Function;

#[derive(Debug, Clone)]
pub enum Value {
    Number(f64),
    Str(String),
    Bool(bool),
    Function(Rc<Function>),
    Null
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
            },
            Value::Str(s) => {
                s.to_string()
            }
            Value::Bool(b) => {
                if *b {
                    "Verdadeiro".to_string()
                } else {
                    "Falso".to_string()
                }
            }
            Value::Function(f) => format!("Função {}", f.name),
            Value::Null => {
                "Nulo".to_string()
            }
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
            _ => false,  
        }
    }
}