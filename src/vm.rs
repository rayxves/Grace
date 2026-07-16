mod call_frame;

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use crate::chunk::{
    Chunk,
    opcode::{BinaryOpCode, OpCode},
};
use crate::value::function::Function;
use crate::value::{BoundMethod, Instance, Value};
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
                    if self.op_return(&function)? {
                        return Ok(());
                    }
                }
                Some(OpCode::Negate) => {
                    let n = self.pop_number(&function)?;
                    self.push(Value::Number(-n));
                }
                Some(OpCode::Add) => self.binary_op(&function, BinaryOpCode::Add)?,
                Some(OpCode::Subtract) => self.binary_op(&function, BinaryOpCode::Subtract)?,
                Some(OpCode::Multiply) => self.binary_op(&function, BinaryOpCode::Multiply)?,
                Some(OpCode::Divide) => self.op_divide(&function)?,
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
                Some(OpCode::GetGlobal) => self.op_get_global(&function)?,
                Some(OpCode::SetGlobal) => self.op_set_global(&function)?,
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
                    let cond = self.peek(&function)?;
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
                    let value = self.peek(&function)?;
                    self.stack[base + slot as usize] = value;
                }
                Some(OpCode::Call) => self.op_call(&function)?,
                Some(OpCode::GetProperty) => self.op_get_property(&function)?,
                Some(OpCode::SetProperty) => self.op_set_property(&function)?,
                Some(OpCode::GetSuper) => self.op_get_super(&function)?,
                None => {
                    return Err(VmError::new(
                        "Erro desconhecido.".to_string(),
                        self.cur_line(&function),
                    ));
                }
            }
        }
    }

    fn op_return(&mut self, function: &Rc<Function>) -> Result<bool, VmError> {
        let result = self.pop(function)?;
        let base = self.frames.pop().unwrap().base;
        if self.frames.is_empty() {
            return Ok(true);
        }
        self.stack.truncate(base);
        self.push(result);
        Ok(false)
    }

    fn op_divide(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let b = self.pop_number(function)?;
        let a = self.pop_number(function)?;
        if b == 0.0 {
            return Err(VmError::new(
                "Não é possível realizar uma divisão por 0.".to_string(),
                self.cur_line(function),
            ));
        }
        self.push(Value::Number(a / b));
        Ok(())
    }

    fn op_get_global(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let name = self.read_name(function)?;
        match self.globals.get(&name) {
            Some(value) => {
                let value = value.clone();
                self.push(value);
                Ok(())
            }
            None => Err(VmError::new(
                format!("Variável '{}' não foi definida.", name),
                self.cur_line(function),
            )),
        }
    }

    fn op_set_global(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let name = self.read_name(function)?;
        if self.globals.contains_key(&name) {
            let value = self.peek(function)?;
            self.globals.insert(name, value);
            Ok(())
        } else {
            Err(VmError::new(
                "Não é possível atribuir valor a uma variável que não foi declarada antes."
                    .to_string(),
                self.cur_line(function),
            ))
        }
    }

    fn op_call(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let arg_count = self.read_byte(function);
        let base = self.stack.len() - arg_count as usize - 1;
        match self.stack[base].clone() {
            Value::Function(callee) => self.call_function(function, callee, arg_count, base),
            Value::Class(class) => self.instantiate_class(function, class, arg_count, base),
            Value::BoundMethod(bound) => self.call_bound_method(function, bound, arg_count, base),
            _ => Err(VmError::new(
                "Só é possível chamar funções, classes ou métodos.".into(),
                self.cur_line(function),
            )),
        }
    }

    fn call_function(
        &mut self,
        function: &Rc<Function>,
        callee: Rc<Function>,
        arg_count: u8,
        base: usize,
    ) -> Result<(), VmError> {
        if arg_count as u64 != callee.arity {
            return Err(VmError::new(
                format!(
                    "A função '{}' espera {} argumento(s), mas recebeu {}.",
                    callee.name, callee.arity, arg_count
                ),
                self.cur_line(function),
            ));
        }
        self.frames.push(CallFrame::new(callee, 0, base));
        Ok(())
    }

    fn instantiate_class(
        &mut self,
        function: &Rc<Function>,
        class: Rc<crate::value::Class>,
        arg_count: u8,
        base: usize,
    ) -> Result<(), VmError> {
        let mut fields = HashMap::new();
        for attribute in &class.attributes {
            fields.insert(attribute.clone(), Value::Null);
        }
        let instance = Rc::new(RefCell::new(Instance {
            class: class.clone(),
            fields,
        }));

        match class.methods.get("construtor") {
            Some(constructor) => {
                if arg_count as u64 != constructor.arity {
                    return Err(VmError::new(
                        format!(
                            "O construtor da classe '{}' espera {} argumento(s), mas recebeu {}.",
                            class.name, constructor.arity, arg_count
                        ),
                        self.cur_line(function),
                    ));
                }

                self.stack[base] = Value::Instance(instance);
                self.frames
                    .push(CallFrame::new(constructor.clone(), 0, base));
            }
            None => {
                if arg_count > 0 {
                    return Err(VmError::new(
                        format!(
                            "A classe '{}' não tem construtor, portanto não aceita argumentos.",
                            class.name
                        ),
                        self.cur_line(function),
                    ));
                }
                self.stack.truncate(base);
                self.push(Value::Instance(instance));
            }
        }
        Ok(())
    }

    fn op_get_property(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let instance = self.pop(function)?;
        let name = self.read_name(function)?;
        let inst = match instance {
            Value::Instance(inst) => inst,
            other => {
                return Err(VmError::new(
                    format!(
                        "Não é possível acessar o atributo '{}': '{}' não é uma instância de uma classe.",
                        name,
                        other.to_display()
                    ),
                    self.cur_line(function),
                ));
            }
        };

        if let Some(value) = inst.borrow().fields.get(&name).cloned() {
            self.push(value);
            return Ok(());
        }
        if let Some(method) = inst.borrow().class.methods.get(&name).cloned() {
            let bound = BoundMethod {
                receiver: inst.clone(),
                method,
            };
            self.push(Value::BoundMethod(Rc::new(bound)));
            return Ok(());
        }

        let borrowed = inst.borrow();
        let available = self.available_attributes(&borrowed.class.attributes);
        Err(VmError::new(
            format!(
                "O atributo '{}' não existe na classe '{}'. Atributos disponíveis: {}.",
                name, borrowed.class.name, available
            ),
            self.cur_line(function),
        ))
    }

    fn op_set_property(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let value = self.pop(function)?;
        let instance = self.pop(function)?;
        let name = self.read_name(function)?;
        let inst = match instance {
            Value::Instance(inst) => inst,
            other => {
                return Err(VmError::new(
                    format!(
                        "Não é possível atribuir o atributo '{}': '{}' não é uma instância de uma classe.",
                        name,
                        other.to_display()
                    ),
                    self.cur_line(function),
                ));
            }
        };

        let exists = inst.borrow().fields.contains_key(&name);
        if exists {
            inst.borrow_mut().fields.insert(name, value.clone());
            self.push(value);
            Ok(())
        } else {
            let borrowed = inst.borrow();
            let available = self.available_attributes(&borrowed.class.attributes);
            Err(VmError::new(
                format!(
                    "Não é possível atribuir a '{}': esse atributo não existe na classe '{}'. Atributos disponíveis: {}.",
                    name, borrowed.class.name, available
                ),
                self.cur_line(function),
            ))
        }
    }


    fn op_get_super(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let index = self.read_byte(function);
        let method = match &function.chunk.pool[index as usize] {
            Value::Function(f) => f.clone(),
            _ => {
                return Err(VmError::new(
                    "Erro interno: esperava um método no pool para 'super'.".to_string(),
                    self.cur_line(function),
                ));
            }
        };
        let instance = self.pop(function)?;
        let inst = match instance {
            Value::Instance(inst) => inst,
            other => {
                return Err(VmError::new(
                    format!(
                        "'super' precisa de uma instância, mas recebi '{}'.",
                        other.to_display()
                    ),
                    self.cur_line(function),
                ));
            }
        };
        let bound = BoundMethod {
            receiver: inst,
            method,
        };
        self.push(Value::BoundMethod(Rc::new(bound)));
        Ok(())
    }

    fn available_attributes(&self, attrs: &[String]) -> String {
        if attrs.is_empty() {
            "nenhum".to_string()
        } else {
            attrs
                .iter()
                .map(|a| format!("'{}'", a))
                .collect::<Vec<_>>()
                .join(", ")
        }
    }
    fn call_bound_method(
        &mut self,
        function: &Rc<Function>,
        bound: Rc<BoundMethod>,
        arg_count: u8,
        base: usize,
    ) -> Result<(), VmError> {
        if arg_count as u64 != bound.method.arity {
            return Err(VmError::new(
                format!(
                    "O método '{}' espera {} argumento(s), mas recebeu {}.",
                    bound.method.name, bound.method.arity, arg_count
                ),
                self.cur_line(function),
            ));
        }
        self.stack[base] = Value::Instance(bound.receiver.clone());
        self.frames
            .push(CallFrame::new(bound.method.clone(), 0, base));
        Ok(())
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
    fn peek(&self, function: &Rc<Function>) -> Result<Value, VmError> {
        self.stack.last().cloned().ok_or(VmError::new(
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
