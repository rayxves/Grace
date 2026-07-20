use std::rc::Rc;

use crate::value::function::Function;

pub struct CallFrame {
    pub function: Rc<Function>,
    pub ip: usize,
    pub base: usize,
}

impl CallFrame {
    pub fn new(function: Rc<Function>, ip: usize, base: usize) -> CallFrame {
        CallFrame { function, ip, base }
    }
}