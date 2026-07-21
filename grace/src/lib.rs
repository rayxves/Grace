mod ast_serializer;
mod chunk;
mod compiler;
mod events;
mod expr;
mod parser;
mod resolver;
mod scanner;
mod stmt;
mod token;
mod trace;
mod value;
mod vm;

use std::cell::RefCell;
use std::rc::Rc;

use ast_serializer::{AstNode, AstSerializer};
use compiler::Compiler;
use events::{Event, ScanEvent, SharedSink, VmEvent};
use parser::Parser;
use scanner::Scanner;
use stmt::StmtVisitor;
use trace::TraceCollector;
use vm::Vm;

use wasm_bindgen::prelude::*;

pub fn gera_trace(fonte: &str) -> String {
    let collector = Rc::new(RefCell::new(TraceCollector::new()));
    let sink: SharedSink = collector.clone();

    let mut scanner = Scanner::new(fonte.to_string(), sink.clone());
    let tokens = match scanner.scan_tokens() {
        Ok(tokens) => tokens,
        Err(token_error) => {
            sink.borrow_mut().emit(Event::Scan(ScanEvent::Error {
                message: token_error.message,
                line: token_error.line,
            }));
            let ast: Option<AstNode> = None;
            return collector.borrow().to_json(&ast);
        }
    };

    let mut parser = Parser::new(tokens, sink.clone());
    let statements = parser.parse();

    let mut serializer = AstSerializer;
    let ast_nodes: Vec<AstNode> = statements
        .iter()
        .map(|s| s.accept(&mut serializer))
        .collect();
    let root = AstNode {
        id: None,
        kind: "Programa".to_string(),
        label: "programa".to_string(),
        line: None,
        children: ast_nodes,
    };
    let ast = Some(root);

    let mut compiler = Compiler::new(sink.clone());
    compiler.compile(&statements);
    let chunk = compiler.into_chunk();

    let mut vm = Vm::new(sink.clone());
    if let Err(vm_error) = vm.run(&chunk) {
        sink.borrow_mut().emit(Event::Vm(VmEvent::Error {
            message: vm_error.message,
            line: vm_error.line,
        }));
    }

    let json = collector.borrow().to_json(&ast);
    json
}

#[wasm_bindgen]
pub fn executar(fonte: &str) -> String {
    gera_trace(fonte)
}
