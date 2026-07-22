use std::{cell::RefCell, rc::Rc};

use crate::token::Token;

pub type SharedSink = Rc<RefCell<dyn EventSink>>;
pub trait EventSink {
    fn emit(&mut self, event: Event);
}

pub enum Event {
    Scan(ScanEvent),
    Parse(ParseEvent),
    Resolve(ResolveEvent),
    Compile(CompileEvent),
    Vm(VmEvent),   
}

pub enum ScanEvent {
    Token(Token),
    Error { message: String, line: u64 },
}

pub enum ParseEvent {
    Error { message: String, line: u64 },
}

pub enum ResolveEvent {
    ScopeBegin,
    ScopeEnd,
    Declare {
        name: String,
        line: u64,
    },
    Define {
        name: String,
    },
    Resolve {
        id: usize,
        name: String,
        depth: usize,
    },
    Error {
        message: String,
        line: u64,
    },
}

pub enum CompileEvent {
    Emit {
        offset: usize,
        opcode: String,
        line: u64,
    },
    Error {
        message: String,
        line: u64,
    },
}

pub enum VmEvent {
    Step {
        offset: usize,
        line: u64,
        node_id: Option<usize>,
        loop_iteration: Option<usize>,
        instruction: String,
        stack: Vec<String>,
        popped: Vec<String>,
        pushed: Vec<String>,
        globals: Vec<(String, String)>,
        locals: Vec<(String, String)>,
        call_stack: Vec<(String, Option<u64>)>,
    },
    Error {
        message: String,
        line: u64,
        offset: usize,
    },
}