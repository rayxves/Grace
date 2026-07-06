use std::collections::HashMap;

use crate::{
    chunk::{
        Chunk,
        debug::disassemble_instruction,
        opcode::{BinaryOpCode, OpCode},
    },
    value::Value,
};

pub struct Vm {
    ip: usize,
    stack: Vec<Value>,
    globals: HashMap<String, Value>,
}

pub struct VmError {
    pub message: String,
    pub line: u64,
}

impl VmError {
    pub fn new(message: String, line: u64) -> VmError {
        VmError { message, line }
    }
}

impl Vm {
    pub fn new() -> Vm {
        Vm {
            ip: 0,
            stack: Vec::new(),
            globals: HashMap::new(),
        }
    }

    pub fn run(&mut self, chunk: &Chunk) -> Result<(), VmError> {
        loop {
            println!("Pilha: {:?}", self.stack);
            disassemble_instruction(chunk, self.ip);
            let byte = self.read_byte(chunk);
            let decoded = OpCode::from_byte(byte);
            match decoded {
                Some(OpCode::Constant) => {
                    let next_byte = self.read_byte(chunk);
                    let value = chunk.pool[next_byte as usize].clone();
                    self.push(value);
                }
                Some(OpCode::Return) => return Ok(()),
                Some(OpCode::Negate) => {
                    let n = self.pop_number(chunk)?;
                    self.push(Value::Number(-n));
                }

                Some(OpCode::Add) => {
                    self.binary_op(chunk, BinaryOpCode::Add)?;
                }
                Some(OpCode::Subtract) => {
                    self.binary_op(chunk, BinaryOpCode::Subtract)?;
                }
                Some(OpCode::Multiply) => {
                    self.binary_op(chunk, BinaryOpCode::Multiply)?;
                }
                Some(OpCode::Divide) => {
                    let b = self.pop_number(chunk)?;
                    let a = self.pop_number(chunk)?;
                    if b == 0.0 {
                        return Err(VmError::new(
                            "Não é possível realizar uma divisão por 0.".to_string(),
                            chunk.lines[self.ip - 1],
                        ));
                    }
                    self.push(Value::Number(a / b));
                }
                Some(OpCode::Print) => {
                    let v = self.pop(chunk)?;
                    println!("{}", v.to_display());
                }
                Some(OpCode::Pop) => {
                    self.pop(chunk)?;
                }
                Some(OpCode::DefineGlobal) => {
                    let name = self.read_name(chunk)?;
                    let value = self.pop(chunk)?;
                    self.globals.insert(name, value);
                }
                Some(OpCode::GetGlobal) => {
                    let name = self.read_name(chunk)?;
                    match self.globals.get(&name) {
                        Some(value) => {
                            let value = value.clone();
                            self.push(value);
                        }
                        None => {
                            return Err(VmError::new(
                                format!("Variável '{}' não foi definida.", name),
                                chunk.lines[self.ip - 1],
                            ));
                        }
                    }
                }
                Some(OpCode::SetGlobal) => {
                    let name = self.read_name(chunk)?;
                    if self.globals.contains_key(&name) {
                        let value = self.stack.last();
                        match value {
                            Some(v) => {
                                self.globals.insert(name, v.clone());
                            }
                            None => {
                                return Err(VmError::new(
                                    "Erro interno: pilha vazia.".to_string(),
                                    chunk.lines[self.ip - 1],
                                ));
                            }
                        }
                    } else {
                        return Err(VmError::new("Não é possível atribuir valor a uma variável que não foi declarada antes.".to_string(), chunk.lines[self.ip - 1]));
                    }
                }
                Some(OpCode::True) => {
                    self.push(Value::Bool(true));
                }
                Some(OpCode::False) => {
                    self.push(Value::Bool(false));
                }
                Some(OpCode::Null) => {
                    self.push(Value::Null);
                }
                Some(OpCode::Not) => {
                    let value = self.pop(chunk)?;
                    let truthy_value = self.is_truthy(value);
                    self.push(Value::Bool(!truthy_value));
                }
                Some(OpCode::Greater) => {
                    let a = self.pop_number(chunk)?;
                    let b = self.pop_number(chunk)?;
                    self.push(Value::Bool(b > a));
                }
                Some(OpCode::Less) => {
                    let a = self.pop_number(chunk)?;
                    let b = self.pop_number(chunk)?;
                    self.push(Value::Bool(b < a));
                }
                Some(OpCode::Equal) => {
                    let a = self.pop(chunk)?;
                    let b = self.pop(chunk)?;
                    self.push(Value::Bool(b == a));
                }
                Some(OpCode::Jump) => {
                    let offset = self.read_byte(chunk);
                    self.ip += offset as usize;
                }
                Some(OpCode::JumpIfFalse) => {
                    let offset = self.read_byte(chunk);
                    let cond = match self.stack.last() {
                        Some(v) => v.clone(),
                        None => {
                            return Err(VmError::new(
                                "Erro interno: pilha vazia".into(),
                                chunk.lines[self.ip - 1],
                            ));
                        }
                    };

                    if !self.is_truthy(cond) {
                        self.ip += offset as usize;
                    }
                }
                Some(OpCode::Loop) => {
                    let offset = self.read_byte(chunk);
                    self.ip -= offset as usize;
                }
                None => {
                    return Err(VmError::new(
                        "Erro desconhecido.".to_string(),
                        chunk.lines[self.ip - 1],
                    ));
                }
            }
        }
    }

    pub fn is_truthy(&self, value: Value) -> bool {
        match value {
            Value::Bool(b) => b,
            Value::Null => false,
            _ => true,
        }
    }

    fn read_name(&mut self, chunk: &Chunk) -> Result<String, VmError> {
        let index = self.read_byte(chunk);
        match &chunk.pool[index as usize] {
            Value::Str(s) => Ok(s.clone()),
            _ => Err(VmError::new(
                "Erro interno: esperava nome de variável no pool.".to_string(),
                chunk.lines[self.ip - 1],
            )),
        }
    }

    pub fn read_byte(&mut self, chunk: &Chunk) -> u8 {
        let byte = chunk.code[self.ip];
        self.ip += 1;
        return byte;
    }

    pub fn push(&mut self, value: Value) {
        self.stack.push(value);
    }
    pub fn pop(&mut self, chunk: &Chunk) -> Result<Value, VmError> {
        let value = self.stack.pop();
        match value {
            Some(v) => return Ok(v),
            None => {
                return Err(VmError::new(
                    "Erro interno, pilha vazia.".to_string(),
                    chunk.lines[self.ip - 1],
                ));
            }
        }
    }

    pub fn pop_number(&mut self, chunk: &Chunk) -> Result<f64, VmError> {
        let value = self.pop(chunk)?;
        match value {
            Value::Number(n) => Ok(n),
            other => Err(VmError::new(
                format!("Esperava um número e recebi: {}", other.to_display()),
                chunk.lines[self.ip - 1],
            )),
        }
    }

    pub fn binary_op(&mut self, chunk: &Chunk, op_code: BinaryOpCode) -> Result<(), VmError> {
        let b = self.pop_number(chunk)?;
        let a = self.pop_number(chunk)?;
        match op_code {
            BinaryOpCode::Add => return Ok(self.push(Value::Number(a + b))),
            BinaryOpCode::Subtract => return Ok(self.push(Value::Number(a - b))),
            BinaryOpCode::Multiply => return Ok(self.push(Value::Number(a * b))),
        }
    }
}
