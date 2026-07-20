use crate::chunk::{
    Chunk,
    opcode::{OpCode, OperandKind},
};

pub fn disassemble_chunk(chunk: &Chunk, name: String) {
    println!("== {} ==", name);
    println!("{:>6}  {:>5}  {}", "byte", "linha", "instrução");
    let mut offset = 0;
    while offset < chunk.code.len() {
        offset = disassemble_instruction(chunk, offset);
    }
    println!();
}

pub fn disassemble_instruction(chunk: &Chunk, offset: usize) -> usize {
    let line = chunk.lines.get(offset).copied().unwrap_or(0);
    print!("{:>6}  {:>5}  ", offset, line);

    let byte = chunk.code[offset];
    let opcode = match OpCode::from_byte(byte) {
        Some(op) => op,
        None => {
            println!("instrução desconhecida (byte {})", byte);
            return offset + 1;
        }
    };

    let text = describe(chunk, opcode, offset);
    println!("{}", text);
    offset + opcode.size()
}

pub fn describe(chunk: &Chunk, opcode: OpCode, offset: usize) -> String {
    let name = opcode.description();
    match opcode.operand_kind() {
        OperandKind::None => name,

        OperandKind::PoolIndex => {
            let index = chunk.code[offset + 1] as usize;
            match chunk.pool.get(index) {
                Some(value) => format!("{} {}", name, value.to_display()),
                None => format!("{} (constante {} não existe no pool)", name, index),
            }
        }

        OperandKind::Slot => {
            let slot = chunk.code[offset + 1];
            format!("{} (slot {})", name, slot)
        }

        OperandKind::ArgCount => {
            let count = chunk.code[offset + 1];
            format!("{} com {} argumento(s)", name, count)
        }

        OperandKind::JumpOffset => {
            let jump = chunk.code[offset + 1] as usize;
            let destination = match opcode {
                OpCode::Loop => (offset + 2).saturating_sub(jump),
                _ => offset + 2 + jump,
            };
            format!("{} para o byte {}", name, destination)
        }
    }
}