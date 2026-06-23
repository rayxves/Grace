#[repr(u8)] //represente isso como um u8 por baixo
pub enum OpCode {
    Return,
    Constant
}

impl OpCode {
    pub fn from_byte(byte: u8) -> Option<OpCode>{
        match byte {
            0 => Some(OpCode::Return),
            1 => Some(OpCode::Constant),
            _ => None
        }
    }
}