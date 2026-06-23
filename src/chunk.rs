use crate::value::Value;

pub mod opcode;
pub mod debug;
pub struct Chunk {
    pub code: Vec<u8>,
    pub pool: Vec<Value>
}

impl Chunk {
    pub fn new() -> Chunk{
        Chunk {
            code: Vec::new(),
            pool: Vec::new()
        }
    }

    pub fn append(&mut self, byte: u8){
        self.code.push(byte);
    }

    pub fn add_constant(&mut self, value: Value) -> usize{
        self.pool.push(value);
        self.pool.len() - 1
    }
}