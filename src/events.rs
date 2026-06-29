use std::{cell::RefCell, rc::Rc};

use crate::token::Token;

pub type SharedSink = Rc<RefCell<dyn EventSink>>;
pub trait EventSink {
    fn emit(&mut self, event: Event);
}

pub enum Event {
    Scan(ScanEvent)
}

pub enum ScanEvent {
    Token(Token),
    Error {
        message: String,
        line: u64
    }
}