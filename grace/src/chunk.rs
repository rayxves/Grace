use crate::value::Value;

pub mod opcode;
pub mod debug;

#[derive(Debug, Clone, PartialEq)]
pub struct LoopRange {
    pub node_id: usize,
    pub start: usize,
    pub end: usize,
}

#[derive(Debug, Clone, PartialEq)]
pub struct LocalRange {
    pub name: String,
    pub slot: usize,
    pub start: usize,
    pub end: usize,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Chunk {
    pub code: Vec<u8>,
    pub pool: Vec<Value>,
    pub lines: Vec<u64>,
    pub node_ids: Vec<Option<usize>>,
    pub loops: Vec<LoopRange>,
    pub local_ranges: Vec<LocalRange>,
}

impl Chunk {
    pub fn new() -> Chunk{
        Chunk {
            code: Vec::new(),
            pool: Vec::new(),
            lines: Vec::new(),
            node_ids: Vec::new(),
            loops: Vec::new(),
            local_ranges: Vec::new(),
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
