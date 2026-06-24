mod chunk;
mod value;
mod vm;
use crate::{
    chunk::{Chunk, opcode::OpCode},
    value::Value,
    vm::Vm,
};
fn main() {
    let mut c = Chunk::new();
    let a = c.add_constant(Value::Number(1.0));
    let z = c.add_constant(Value::Number(0.0));
    c.append(OpCode::Constant as u8, 4);
    c.append(a as u8, 4);
    c.append(OpCode::Constant as u8, 4);
    c.append(z as u8, 4);
    c.append(OpCode::Divide as u8, 4);
    c.append(OpCode::Return as u8, 4);
    let mut vm = Vm::new();
    if let Err(e) = vm.run(&c) {
        println!(">>> Erro na linha {}: {}", e.line, e.message);
    }
}
