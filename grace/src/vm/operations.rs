use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use super::{Vm, VmError};
use crate::chunk::opcode::BinaryOpCode;
use crate::value::function::Function;
use crate::value::{BoundMethod, Class, Instance, Value};
use crate::vm::call_frame::CallFrame;

impl Vm {

    pub(crate) fn op_negate(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let n = self.pop_number(function)?;
        self.push(Value::Number(-n));
        Ok(())
    }

    pub(crate) fn binary_op(
        &mut self,
        function: &Rc<Function>,
        op: BinaryOpCode,
    ) -> Result<(), VmError> {
        match op {
            BinaryOpCode::Add => self.op_add(function),
            BinaryOpCode::Subtract => {
                let b = self.pop_number(function)?;
                let a = self.pop_number(function)?;
                self.push(Value::Number(a - b));
                Ok(())
            }
            BinaryOpCode::Multiply => {
                let b = self.pop_number(function)?;
                let a = self.pop_number(function)?;
                self.push(Value::Number(a * b));
                Ok(())
            }
        }
    }

    fn op_add(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let b = self.pop(function)?;
        let a = self.pop(function)?;
        match (a, b) {
            (Value::Number(a), Value::Number(b)) => {
                self.push(Value::Number(a + b));
                Ok(())
            }
            (Value::Str(a), Value::Str(b)) => {
                self.push(Value::Str(format!("{}{}", a, b)));
                Ok(())
            }
            (a, b) => Err(VmError::new(
                format!(
                    "O operador '+' funciona com dois números (soma) ou duas strings (concatenação), mas recebi '{}' e '{}'.",
                    a.to_display(),
                    b.to_display()
                ),
                self.cur_line(function),
                self.cur_offset(),
            )),
        }
    }

    pub(crate) fn op_divide(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let b = self.pop_number(function)?;
        let a = self.pop_number(function)?;
        if b == 0.0 {
            return Err(VmError::new(
                "Não é possível dividir por zero.".to_string(),
                self.cur_line(function),
                self.cur_offset(),
            ));
        }
        self.push(Value::Number(a / b));
        Ok(())
    }

    pub(crate) fn op_equal(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let b = self.pop(function)?;
        let a = self.pop(function)?;
        self.push(Value::Bool(a == b));
        Ok(())
    }

    pub(crate) fn op_compare(
        &mut self,
        function: &Rc<Function>,
        greater: bool,
    ) -> Result<(), VmError> {
        let b = self.pop_number(function)?;
        let a = self.pop_number(function)?;
        let result = if greater { a > b } else { a < b };
        self.push(Value::Bool(result));
        Ok(())
    }

    pub(crate) fn op_define_global(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let name = self.read_name(function)?;
        let value = self.pop(function)?;
        self.globals.insert(name, value);
        Ok(())
    }

    pub(crate) fn op_get_global(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let name = self.read_name(function)?;
        match self.globals.get(&name) {
            Some(value) => {
                let value = value.clone();
                self.push(value);
                Ok(())
            }
            None => Err(VmError::new(
                format!(
                    "A variável '{}' não existe. Declare ela antes de usar, como em 'var {} = ...;'.",
                    name, name
                ),
                self.cur_line(function),
                self.cur_offset(),
            )),
        }
    }

    pub(crate) fn op_set_global(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let name = self.read_name(function)?;
        if self.globals.contains_key(&name) {
            let value = self.peek(function)?;
            self.globals.insert(name, value);
            Ok(())
        } else {
            Err(VmError::new(
                format!(
                    "A variável '{}' não foi declarada. Use 'var {} = ...;' para criá-la antes de atribuir.",
                    name, name
                ),
                self.cur_line(function),
                self.cur_offset(),
            ))
        }
    }

    pub(crate) fn op_get_local(&mut self, function: &Rc<Function>) {
        let slot = self.read_byte(function);
        let base = self.frame().base;
        self.push(self.stack[base + slot as usize].clone());
    }

    pub(crate) fn op_set_local(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let slot = self.read_byte(function);
        let base = self.frame().base;
        let value = self.peek(function)?;
        self.stack[base + slot as usize] = value;
        Ok(())
    }

    pub(crate) fn op_return(&mut self, function: &Rc<Function>) -> Result<bool, VmError> {
        let result = self.pop(function)?;
        let base = self.frames.pop().unwrap().base;
        if self.frames.is_empty() {
            return Ok(true);
        }
        self.stack.truncate(base);
        self.push(result);
        Ok(false)
    }

    pub(crate) fn op_call(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let arg_count = self.read_byte(function);
        let base = self.stack.len() - arg_count as usize - 1;
        match self.stack[base].clone() {
            Value::Function(callee) => self.call_function(function, callee, arg_count, base),
            Value::Class(class) => self.instantiate_class(function, class, arg_count, base),
            Value::BoundMethod(bound) => self.call_bound_method(function, bound, arg_count, base),
            other => Err(VmError::new(
                format!(
                    "Só é possível chamar funções, classes ou métodos, mas '{}' não é nenhum deles.",
                    other.to_display()
                ),
                self.cur_line(function),
                self.cur_offset(),
            )),
        }
    }

    pub(crate) fn call_function(
        &mut self,
        function: &Rc<Function>,
        callee: Rc<Function>,
        arg_count: u8,
        base: usize,
    ) -> Result<(), VmError> {
        self.check_arity(function, &callee.name, "A função", callee.arity, arg_count)?;
        self.frames.push(CallFrame::new(callee, 0, base));
        Ok(())
    }

    pub(crate) fn call_bound_method(
        &mut self,
        function: &Rc<Function>,
        bound: Rc<BoundMethod>,
        arg_count: u8,
        base: usize,
    ) -> Result<(), VmError> {
        self.check_arity(
            function,
            &bound.method.name,
            "O método",
            bound.method.arity,
            arg_count,
        )?;
        self.stack[base] = Value::Instance(bound.receiver.clone());
        self.frames
            .push(CallFrame::new(bound.method.clone(), 0, base));
        Ok(())
    }

    pub(crate) fn instantiate_class(
        &mut self,
        function: &Rc<Function>,
        class: Rc<Class>,
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
                self.check_arity(
                    function,
                    &class.name,
                    "O construtor da classe",
                    constructor.arity,
                    arg_count,
                )?;
                self.stack[base] = Value::Instance(instance);
                self.frames
                    .push(CallFrame::new(constructor.clone(), 0, base));
                Ok(())
            }
            None => {
                if arg_count > 0 {
                    return Err(VmError::new(
                        format!(
                            "A classe '{}' não tem construtor, então '{}()' não aceita argumentos. \
                             Declare 'construtor(...)' dentro da classe para poder passar valores.",
                            class.name, class.name
                        ),
                        self.cur_line(function),
                        self.cur_offset(),
                    ));
                }
                self.stack.truncate(base);
                self.push(Value::Instance(instance));
                Ok(())
            }
        }
    }

    fn check_arity(
        &self,
        function: &Rc<Function>,
        name: &str,
        what: &str,
        expected: u64,
        received: u8,
    ) -> Result<(), VmError> {
        if expected != received as u64 {
            return Err(VmError::new(
                format!(
                    "{} '{}' espera {} argumento(s), mas recebeu {}.",
                    what, name, expected, received
                ),
                self.cur_line(function),
                self.cur_offset(),
            ));
        }
        Ok(())
    }

    pub(crate) fn op_get_property(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let instance = self.pop(function)?;
        let name = self.read_name(function)?;
        let inst = self.expect_instance(function, instance, &name, "acessar")?;

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
        Err(VmError::new(
            format!(
                "A classe '{}' não tem o atributo nem o método '{}'. Atributos disponíveis: {}.",
                borrowed.class.name,
                name,
                available_attributes(&borrowed.class.attributes)
            ),
            self.cur_line(function),
            self.cur_offset(),
        ))
    }

    pub(crate) fn op_set_property(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let value = self.pop(function)?;
        let instance = self.pop(function)?;
        let name = self.read_name(function)?;
        let inst = self.expect_instance(function, instance, &name, "atribuir")?;

        let exists = inst.borrow().fields.contains_key(&name);
        if exists {
            inst.borrow_mut().fields.insert(name, value.clone());
            self.push(value);
            Ok(())
        } else {
            let borrowed = inst.borrow();
            Err(VmError::new(
                format!(
                    "O atributo '{}' não foi declarado na classe '{}'. Atributos disponíveis: {}. \
                     Para criar um novo, declare 'var {};' dentro da classe.",
                    name,
                    borrowed.class.name,
                    available_attributes(&borrowed.class.attributes),
                    name
                ),
                self.cur_line(function),
                self.cur_offset(),
            ))
        }
    }

    pub(crate) fn op_get_super(&mut self, function: &Rc<Function>) -> Result<(), VmError> {
        let index = self.read_byte(function);
        let method = match &function.chunk.pool[index as usize] {
            Value::Function(f) => f.clone(),
            _ => {
                return Err(VmError::new(
                    "Erro interno: esperava um método no pool para o 'super'.".to_string(),
                    self.cur_line(function),
                    self.cur_offset(),
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
                    self.cur_offset(),
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

    fn expect_instance(
        &self,
        function: &Rc<Function>,
        value: Value,
        name: &str,
        action: &str,
    ) -> Result<Rc<RefCell<Instance>>, VmError> {
        match value {
            Value::Instance(inst) => Ok(inst),
            other => Err(VmError::new(
                format!(
                    "Não é possível {} o atributo '{}': '{}' não é uma instância de uma classe.",
                    action,
                    name,
                    other.to_display()
                ),
                self.cur_line(function),
                self.cur_offset(),
            )),
        }
    }
}

fn available_attributes(attributes: &[String]) -> String {
    if attributes.is_empty() {
        "nenhum".to_string()
    } else {
        attributes
            .iter()
            .map(|a| format!("'{}'", a))
            .collect::<Vec<_>>()
            .join(", ")
    }
}