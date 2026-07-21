mod call_frame;
mod operations;

use std::collections::HashMap;
use std::rc::Rc;

use crate::events::{Event, VmEvent};
use crate::value::function::Function;
use crate::value::Value;
use crate::vm::call_frame::CallFrame;
use crate::{
    chunk::{
        opcode::{BinaryOpCode, OpCode},
        Chunk,
    },
    events::SharedSink,
};

pub struct Vm {
    pub(crate) stack: Vec<Value>,
    pub(crate) frames: Vec<CallFrame>,
    pub(crate) globals: HashMap<String, Value>,
    pub(crate) sink: SharedSink,
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
    pub fn new(sink: SharedSink) -> Vm {
        Vm {
            stack: Vec::new(),
            frames: Vec::new(),
            globals: HashMap::new(),
            sink,
        }
    }

    pub fn run(&mut self, chunk: &Chunk) -> Result<(), VmError> {
        let script = Rc::new(Function::new("script".to_string(), 0, chunk.clone()));
        self.push(Value::Function(script.clone()));
        self.frames.push(CallFrame::new(script, 0, 0));

        loop {
            let function = self.frames.last().unwrap().function.clone();
            let step_offset = self.frame().ip;
            let step_line = function
                .chunk
                .lines
                .get(self.frame().ip)
                .copied()
                .unwrap_or(0);
            let byte = self.read_byte(&function);
            let opcode = OpCode::from_byte(byte);
            let step_name = opcode
                .map(|op| op.description())
                .unwrap_or_else(|| "?".to_string());
            match OpCode::from_byte(byte) {
                Some(OpCode::Constant) => {
                    let index = self.read_byte(&function);
                    self.push(function.chunk.pool[index as usize].clone());
                }
                Some(OpCode::Return) => {
                    if self.op_return(&function)? {
                        return Ok(());
                    }
                }
                Some(OpCode::Negate) => self.op_negate(&function)?,
                Some(OpCode::Add) => self.binary_op(&function, BinaryOpCode::Add)?,
                Some(OpCode::Subtract) => self.binary_op(&function, BinaryOpCode::Subtract)?,
                Some(OpCode::Multiply) => self.binary_op(&function, BinaryOpCode::Multiply)?,
                Some(OpCode::Divide) => self.op_divide(&function)?,
                Some(OpCode::Print) => {
                    let value = self.pop(&function)?;
                    println!("{}", value.to_display());
                }
                Some(OpCode::Pop) => {
                    self.pop(&function)?;
                }
                Some(OpCode::DefineGlobal) => self.op_define_global(&function)?,
                Some(OpCode::GetGlobal) => self.op_get_global(&function)?,
                Some(OpCode::SetGlobal) => self.op_set_global(&function)?,
                Some(OpCode::True) => self.push(Value::Bool(true)),
                Some(OpCode::False) => self.push(Value::Bool(false)),
                Some(OpCode::Null) => self.push(Value::Null),
                Some(OpCode::Not) => {
                    let value = self.pop(&function)?;
                    let truthy = self.is_truthy(value);
                    self.push(Value::Bool(!truthy));
                }
                Some(OpCode::Equal) => self.op_equal(&function)?,
                Some(OpCode::Greater) => self.op_compare(&function, true)?,
                Some(OpCode::Less) => self.op_compare(&function, false)?,
                Some(OpCode::Jump) => {
                    let offset = self.read_byte(&function);
                    self.frame_mut().ip += offset as usize;
                }
                Some(OpCode::JumpIfFalse) => {
                    let offset = self.read_byte(&function);
                    let condition = self.peek(&function)?;
                    if !self.is_truthy(condition) {
                        self.frame_mut().ip += offset as usize;
                    }
                }
                Some(OpCode::Loop) => {
                    let offset = self.read_byte(&function);
                    self.frame_mut().ip -= offset as usize;
                }
                Some(OpCode::GetLocal) => self.op_get_local(&function),
                Some(OpCode::SetLocal) => self.op_set_local(&function)?,
                Some(OpCode::Call) => self.op_call(&function)?,
                Some(OpCode::GetProperty) => self.op_get_property(&function)?,
                Some(OpCode::SetProperty) => self.op_set_property(&function)?,
                Some(OpCode::GetSuper) => self.op_get_super(&function)?,
                None => {
                    return Err(VmError::new(
                        format!("Erro interno: instrução desconhecida (byte {}).", byte),
                        self.cur_line(&function),
                    ));
                }
            }
            self.emit_step(step_offset, step_line, step_name);
        }
    }

    fn emit_step(&self, offset: usize, line: u64, instruction: String) {
        let stack: Vec<String> = self.stack.iter().skip(1).map(|v| v.to_display()).collect();
        self.sink.borrow_mut().emit(Event::Vm(VmEvent::Step {
            offset,
            line,
            instruction,
            stack,
        }));
    }

    pub(crate) fn frame(&self) -> &CallFrame {
        self.frames.last().unwrap()
    }

    pub(crate) fn frame_mut(&mut self) -> &mut CallFrame {
        self.frames.last_mut().unwrap()
    }

    pub(crate) fn cur_line(&self, function: &Rc<Function>) -> u64 {
        let ip = self.frame().ip;
        function
            .chunk
            .lines
            .get(ip.saturating_sub(1))
            .copied()
            .unwrap_or(0)
    }

    pub(crate) fn read_byte(&mut self, function: &Rc<Function>) -> u8 {
        let ip = self.frame().ip;
        let byte = function.chunk.code[ip];
        self.frame_mut().ip += 1;
        byte
    }

    pub(crate) fn read_name(&mut self, function: &Rc<Function>) -> Result<String, VmError> {
        let index = self.read_byte(function);
        match &function.chunk.pool[index as usize] {
            Value::Str(name) => Ok(name.clone()),
            _ => Err(VmError::new(
                "Erro interno: esperava um nome no pool de constantes.".to_string(),
                self.cur_line(function),
            )),
        }
    }

    pub(crate) fn push(&mut self, value: Value) {
        self.stack.push(value);
    }

    pub(crate) fn pop(&mut self, function: &Rc<Function>) -> Result<Value, VmError> {
        self.stack.pop().ok_or_else(|| {
            VmError::new(
                "Erro interno: a pilha está vazia.".to_string(),
                self.cur_line(function),
            )
        })
    }

    pub(crate) fn peek(&self, function: &Rc<Function>) -> Result<Value, VmError> {
        self.stack.last().cloned().ok_or_else(|| {
            VmError::new(
                "Erro interno: a pilha está vazia.".to_string(),
                self.cur_line(function),
            )
        })
    }

    pub(crate) fn pop_number(&mut self, function: &Rc<Function>) -> Result<f64, VmError> {
        match self.pop(function)? {
            Value::Number(n) => Ok(n),
            other => Err(VmError::new(
                format!(
                    "Esta operação só funciona com números, mas recebi '{}'.",
                    other.to_display()
                ),
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
}
