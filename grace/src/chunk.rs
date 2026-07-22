use crate::value::Value;

pub mod opcode;
pub mod debug;

#[derive(Debug, Clone, PartialEq)]
pub struct Chunk {
    pub code: Vec<u8>,
    pub pool: Vec<Value>,
    pub lines: Vec<u64>,
    pub node_ids: Vec<Option<usize>>,
}

impl Chunk {
    pub fn new() -> Chunk{
        Chunk {
            code: Vec::new(),
            pool: Vec::new(),
            lines: Vec::new(),
            node_ids: Vec::new(),
        }
    }

    pub fn append(&mut self, byte: u8, line: u64, node_id: Option<usize>){
        self.code.push(byte);
        self.lines.push(line);
        self.node_ids.push(node_id);
    }

    pub fn add_constant(&mut self, value: Value) -> usize{
        self.pool.push(value);
        self.pool.len() - 1
    }
}
