use crate::chunk::{Chunk, opcode::OpCode};

pub fn disassemble_chunk(chunk: &Chunk, name: String) {
    println!("{}", name);
    let mut offset = 0;
    while offset < chunk.code.len() {
        let next_offset = disassemble_instruction(chunk, offset);
        offset = next_offset;
    }
    println!();
}
pub fn disassemble_instruction(chunk: &Chunk, offset: usize) -> usize {
    print!("offset {:04} | ", offset);
    let byte = chunk.code[offset];
    match OpCode::from_byte(byte) {
        Some(OpCode::Constant) => {
            let i = chunk.code[offset + 1];
            println!("Constante {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        Some(OpCode::Return) => {
            println!("Retorna");
            offset + 1
        }
        Some(OpCode::Add) => {
            println!("Adicao");
            offset + 1
        }
        Some(OpCode::Subtract) => {
            println!("Subtracao");
            offset + 1
        }
        Some(OpCode::Multiply) => {
            println!("Multiplicacao");
            offset + 1
        }
        Some(OpCode::Divide) => {
            println!("Divisao");
            offset + 1
        }
        Some(OpCode::Negate) => {
            println!("Negacao");
            offset + 1
        }
        Some(OpCode::Print) => {
            println!("Print");
            offset + 1
        }
        Some(OpCode::Pop) => {
            println!("Pop");
            offset + 1
        }
        Some(OpCode::DefineGlobal) => {
            let i = chunk.code[offset + 1];
            println!("DefineGlobal {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        Some(OpCode::GetGlobal) => {
            let i = chunk.code[offset + 1];
            println!("PegaGlobal {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        Some(OpCode::SetGlobal) => {
            let i = chunk.code[offset + 1];
            println!("RedefineGlobal {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        Some(OpCode::True) => {
            println!("Verdadeiro");
            offset + 1
        }
        Some(OpCode::False) => {
            println!("Falso");
            offset + 1
        }
        Some(OpCode::Null) => {
            println!("Null");
            offset + 1
        }
        Some(OpCode::Not) => {
            println!("Não");
            offset + 1
        }
        Some(OpCode::Equal) => {
            println!("Igual");
            offset + 1
        }
        Some(OpCode::Greater) => {
            println!("Maior");
            offset + 1
        }
        Some(OpCode::Less) => {
            println!("Menor");
            offset + 1
        }
        Some(OpCode::Jump) => {
            println!("Desvio");
            offset + 2
        }
        Some(OpCode::JumpIfFalse) => {
            println!("Desvio Falso");
            offset + 2
        }
        Some(OpCode::Loop) => {
            println!("Loop");
            offset + 2
        }
        Some(OpCode::GetLocal) => {
            let slot = chunk.code[offset + 1];
            println!("PegaLocal slot {}", slot);
            offset + 2
        }
        Some(OpCode::SetLocal) => {
            let slot = chunk.code[offset + 1];
            println!("DefineLocal slot {}", slot);
            offset + 2
        }
        Some(OpCode::Call) => {
            let n = chunk.code[offset + 1];
            println!("Chamada ({} args)", n);
            offset + 2
        }
        Some(OpCode::GetProperty) => {
            let i = chunk.code[offset + 1];
            println!("PegaAtributo {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        Some(OpCode::SetProperty) => {
            let i = chunk.code[offset + 1];
            println!("DefineAtributo {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        Some(OpCode::GetSuper) => {
            let i = chunk.code[offset + 1];
            println!("PegaSuper {:?}", chunk.pool[i as usize]);
            offset + 2
        }
        None => {
            println!("Desconhecido");
            offset + 1
        }
    }
}
