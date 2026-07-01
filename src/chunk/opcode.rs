#[repr(u8)] //represente isso como um u8 por baixo
#[derive(Debug, Clone, Copy)] 
pub enum OpCode {
    Return,
    Constant,
    Negate,
    Add,
    Subtract,
    Multiply,
    Divide,
    Print,
    Pop
}

pub enum BinaryOpCode {
    Add,
    Subtract,
    Multiply,
}

impl OpCode {
    pub fn from_byte(byte: u8) -> Option<OpCode> {
        match byte {
            0 => Some(OpCode::Return),
            1 => Some(OpCode::Constant),
            2 => Some(OpCode::Negate),
            3 => Some(OpCode::Add),
            4 => Some(OpCode::Subtract),
            5 => Some(OpCode::Multiply),
            6 => Some(OpCode::Divide),
            7 => Some(OpCode::Print),
            8 => Some(OpCode::Pop),
            _ => None,
        }
    }
}
