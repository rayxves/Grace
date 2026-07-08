use crate::value::Value;

pub mod opcode;
pub mod debug;

#[derive(Debug, Clone, PartialEq)]
pub struct Chunk {
    pub code: Vec<u8>,
    pub pool: Vec<Value>,
    pub lines: Vec<u64>
}

impl Chunk {
    pub fn new() -> Chunk{
        Chunk {
            code: Vec::new(),
            pool: Vec::new(),
            lines: Vec::new()
        }
    }

    pub fn append(&mut self, byte: u8, line: u64){
        self.code.push(byte);
        self.lines.push(line);
    }

    pub fn add_constant(&mut self, value: Value) -> usize{
        self.pool.push(value);
        self.pool.len() - 1
    }
}