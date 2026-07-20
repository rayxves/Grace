use crate::chunk::Chunk;

#[derive(Debug, Clone)]
pub struct Function{
    pub name: String,
    pub arity: u64,
    pub chunk: Chunk
}

impl Function{
    pub fn new(name: String, arity: u64, chunk: Chunk) -> Function{
        Function { name, arity, chunk }
    }
}