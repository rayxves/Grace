use std::collections::HashMap;
use std::rc::Rc;

use crate::value::function::Function;

pub struct CallFrame {
    pub function: Rc<Function>,
    pub ip: usize,
    pub base: usize,
    pub call_line: Option<u64>,
    pub loop_iterations: HashMap<usize, usize>,
}

impl CallFrame {
    pub fn new(function: Rc<Function>, ip: usize, base: usize, call_line: Option<u64>) -> CallFrame {
        CallFrame {
            function,
            ip,
            base,
            call_line,
            loop_iterations: HashMap::new(),
        }
    }
}
