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
}
