use crate::chunk::{Chunk, opcode::OpCode};

pub fn disassemble_chunk(chunk: &Chunk, name: String) {
    println!("{}", name);
    let mut offset = 0;
    while offset < chunk.code.len() {
        let next_offset = disassemble_instruction(chunk, offset);
        offset = next_offset;
    }
}
pub fn disassemble_instruction(chunk: &Chunk, offset: usize) -> usize {
    println!("offset: {}", offset);
    let byte = chunk.code[offset];
    let from_byte = OpCode::from_byte(byte);
    match from_byte {
        Some(OpCode::Constant) => {
            let next_byte = chunk.code[offset + 1];
            let value = &chunk.pool[next_byte as usize];
            println!("Constante: {:?}", value);
            offset + 2
        }
        Some(OpCode::Return) => {
            println!("Retorna");
            offset + 1
        }
        None => {
            println!("OpCode desconhecido.");
            offset + 1
        }
    }
}
