#[derive(Debug, Clone)]
pub enum Value {
    Number(f64),
    Str(String),
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
        }
    }
}
