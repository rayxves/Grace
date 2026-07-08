mod call_frame;

use std::collections::HashMap;
use std::rc::Rc;

use crate::chunk::{
    Chunk,
    opcode::{BinaryOpCode, OpCode},
};
use crate::value::Value;
use crate::value::function::Function;
use crate::vm::call_frame::CallFrame;

pub struct Vm {
    stack: Vec<Value>,
    frames: Vec<CallFrame>,
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
            stack: Vec::new(),
            frames: Vec::new(),
            globals: HashMap::new(),
        }
    }

    pub fn run(&mut self, chunk: &Chunk) -> Result<(), VmError> {
        let script = Rc::new(Function::new("script".to_string(), 0, chunk.clone()));
        self.push(Value::Function(script.clone())); 
        self.frames.push(CallFrame::new(script, 0, 0));

        loop {
            let function = self.frames.last().unwrap().function.clone();
            let byte = self.read_byte(&function);
            match OpCode::from_byte(byte) {
                Some(OpCode::Constant) => {
                    let i = self.read_byte(&function);
                    self.push(function.chunk.pool[i as usize].clone());
                }
                Some(OpCode::Return) => {
                    let val = self.pop(&function)?;
                    let base = self.frames.pop().unwrap().base;
                    if self.frames.is_empty() {
                        return Ok(())
                    } 
                    self.stack.truncate(base);
                    self.push(val);

                },
                Some(OpCode::Negate) => {
                    let n = self.pop_number(&function)?;
                    self.push(Value::Number(-n));
                }
                Some(OpCode::Add) => self.binary_op(&function, BinaryOpCode::Add)?,
                Some(OpCode::Subtract) => self.binary_op(&function, BinaryOpCode::Subtract)?,
                Some(OpCode::Multiply) => self.binary_op(&function, BinaryOpCode::Multiply)?,
                Some(OpCode::Divide) => {
                    let b = self.pop_number(&function)?;
                    let a = self.pop_number(&function)?;
                    if b == 0.0 {
                        return Err(VmError::new(
                            "Não é possível realizar uma divisão por 0.".to_string(),
                            self.cur_line(&function),
                        ));
                    }
                    self.push(Value::Number(a / b));
                }
                Some(OpCode::Print) => {
                    let v = self.pop(&function)?;
                    println!("{}", v.to_display());
                }
                Some(OpCode::Pop) => {
                    self.pop(&function)?;
                }
                Some(OpCode::DefineGlobal) => {
                    let name = self.read_name(&function)?;
                    let value = self.pop(&function)?;
                    self.globals.insert(name, value);
                }
                Some(OpCode::GetGlobal) => {
                    let name = self.read_name(&function)?;
                    match self.globals.get(&name) {
                        Some(value) => {
                            let value = value.clone();
                            self.push(value);
                        }
                        None => {
                            return Err(VmError::new(
                                format!("Variável '{}' não foi definida.", name),
                                self.cur_line(&function),
                            ));
                        }
                    }
                }
                Some(OpCode::SetGlobal) => {
                    let name = self.read_name(&function)?;
                    if self.globals.contains_key(&name) {
                        let value = self.stack.last().cloned().unwrap();
                        self.globals.insert(name, value);
                    } else {
                        return Err(VmError::new("Não é possível atribuir valor a uma variável que não foi declarada antes.".to_string(), self.cur_line(&function)));
                    }
                }
                Some(OpCode::True) => self.push(Value::Bool(true)),
                Some(OpCode::False) => self.push(Value::Bool(false)),
                Some(OpCode::Null) => self.push(Value::Null),
                Some(OpCode::Not) => {
                    let v = self.pop(&function)?;
                    let t = self.is_truthy(v);
                    self.push(Value::Bool(!t));
                }
                Some(OpCode::Greater) => {
                    let a = self.pop_number(&function)?;
                    let b = self.pop_number(&function)?;
                    self.push(Value::Bool(b > a));
                }
                Some(OpCode::Less) => {
                    let a = self.pop_number(&function)?;
                    let b = self.pop_number(&function)?;
                    self.push(Value::Bool(b < a));
                }
                Some(OpCode::Equal) => {
                    let a = self.pop(&function)?;
                    let b = self.pop(&function)?;
                    self.push(Value::Bool(b == a));
                }
                Some(OpCode::Jump) => {
                    let offset = self.read_byte(&function);
                    self.frame_mut().ip += offset as usize;
                }
                Some(OpCode::JumpIfFalse) => {
                    let offset = self.read_byte(&function);
                    let cond = self.stack.last().cloned().ok_or(VmError::new(
                        "Erro interno: pilha vazia".into(),
                        self.cur_line(&function),
                    ))?;
                    if !self.is_truthy(cond) {
                        self.frame_mut().ip += offset as usize;
                    }
                }
                Some(OpCode::Loop) => {
                    let offset = self.read_byte(&function);
                    self.frame_mut().ip -= offset as usize;
                }
                Some(OpCode::GetLocal) => {
                    let slot = self.read_byte(&function);
                    let base = self.frame().base;
                    self.push(self.stack[base + slot as usize].clone());
                }
                Some(OpCode::SetLocal) => {
                    let slot = self.read_byte(&function);
                    let base = self.frame().base;
                    let value = self.stack.last().cloned().unwrap();
                    self.stack[base + slot as usize] = value;
                }
                Some(OpCode::Call) => {
                    let arg_count = self.read_byte(&function);
                    let base = self.stack.len() - arg_count as usize - 1;
                    let callee_fn = match self.stack[base].clone() {
                        Value::Function(f) => f,
                        _ => return Err(VmError::new("Só é possível chamar funções.".into(), 0)),
                    };
                    if arg_count != callee_fn.arity as u8 {
                        return Err(VmError::new("Número de argumentos inválidos.".into(), 0))
                    }
                    let call_frame = CallFrame::new(callee_fn, 0, base);
                    self.frames.push(call_frame);
                }
                None => {
                    return Err(VmError::new(
                        "Erro desconhecido.".to_string(),
                        self.cur_line(&function),
                    ));
                }
            }
        }
    }

    fn frame(&self) -> &CallFrame {
        self.frames.last().unwrap()
    }
    fn frame_mut(&mut self) -> &mut CallFrame {
        self.frames.last_mut().unwrap()
    }
    fn cur_line(&self, function: &Rc<Function>) -> u64 {
        let ip = self.frame().ip;
        function.chunk.lines[ip - 1]
    }
    fn read_byte(&mut self, function: &Rc<Function>) -> u8 {
        let ip = self.frame().ip;
        let byte = function.chunk.code[ip];
        self.frame_mut().ip += 1;
        byte
    }
    fn read_name(&mut self, function: &Rc<Function>) -> Result<String, VmError> {
        let index = self.read_byte(function);
        match &function.chunk.pool[index as usize] {
            Value::Str(s) => Ok(s.clone()),
            _ => Err(VmError::new(
                "Erro interno: esperava nome de variável no pool.".to_string(),
                self.cur_line(function),
            )),
        }
    }
    pub fn is_truthy(&self, value: Value) -> bool {
        match value {
            Value::Bool(b) => b,
            Value::Null => false,
            _ => true,
        }
    }
    fn push(&mut self, value: Value) {
        self.stack.push(value);
    }
    fn pop(&mut self, function: &Rc<Function>) -> Result<Value, VmError> {
        self.stack.pop().ok_or(VmError::new(
            "Erro interno, pilha vazia.".to_string(),
            self.cur_line(function),
        ))
    }
    fn pop_number(&mut self, function: &Rc<Function>) -> Result<f64, VmError> {
        match self.pop(function)? {
            Value::Number(n) => Ok(n),
            other => Err(VmError::new(
                format!("Esperava um número e recebi: {}", other.to_display()),
                self.cur_line(function),
            )),
        }
    }
    fn binary_op(&mut self, function: &Rc<Function>, op: BinaryOpCode) -> Result<(), VmError> {
        let b = self.pop_number(function)?;
        let a = self.pop_number(function)?;
        let r = match op {
            BinaryOpCode::Add => a + b,
            BinaryOpCode::Subtract => a - b,
            BinaryOpCode::Multiply => a * b,
        };
        self.push(Value::Number(r));
        Ok(())
    }

}
