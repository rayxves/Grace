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
                Some(OpCode::Return) => match self.pop(chunk) {
                    Ok(v) => return Ok(println!("{:?}", v)),
                    Err(e) => return Err(e),
                },
                Some(OpCode::Negate) => {
                    let n = self.pop_number(chunk)?;
                    let negate_number = -n;
                    return Ok(self.push(Value::Number(negate_number)));
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
                        return Err(VmError::new("Não é possível realizar uma divisão por 0.".to_string(), chunk.lines[self.ip -1]))
                    }
                    return Ok(self.push(Value::Number(a / b)));
                    
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
            Value::Number(n) => {
                return Ok(n);
            }
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
