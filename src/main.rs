mod chunk;
mod scanner;
mod token;
mod value;
mod vm;
use crate::{
    chunk::{Chunk, opcode::OpCode}, scanner::Scanner, value::Value, vm::Vm,
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

    let mut s = Scanner::new("imprima 1 + 2;".to_string());
    for i in 0..6 {
        match s.scan_token() {
            Ok(t) => println!("{}: {:?}   lexeme={:?}", i, t.token_type, t.lexeme),
            Err(e) => {
                println!("{}: <<ERRO: {}>>", i, e.message);
                break;
            }
        }
    }
}
