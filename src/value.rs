#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Number(f64),
    Str(String),
    Bool(bool),
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
            Value::Null => {
                "Nulo".to_string()
            }
        }
    }
}
