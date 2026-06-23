mod chunk;
mod value;
use crate::{
    chunk::{Chunk, debug::disassemble_chunk, opcode::OpCode}, value::Value,
};
fn main() {
    let mut chunk = Chunk::new();
    let val = Value::Number(1.2);
    let num = chunk.add_constant(val);
    let constant_op: u8 = OpCode::Constant as u8;
    let return_op: u8 = OpCode::Return as u8;
    chunk.append(constant_op);
    chunk.append(num as u8);
    chunk.append(return_op);
    disassemble_chunk(&chunk, "teste".to_string());
}
