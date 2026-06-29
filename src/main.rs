mod ast_serializer;
mod events;
mod expr;
mod parser;
mod resolver;
mod scanner;
mod stmt;
mod token;

use std::cell::RefCell;
use std::rc::Rc;

use ast_serializer::{AstNode, AstSerializer};
use events::{Event, EventSink, ParseEvent, ScanEvent, SharedSink};
use parser::Parser;
use scanner::Scanner;

use crate::{events::ResolveEvent, resolver::Resolver};

struct DebugSink;
impl EventSink for DebugSink {
    fn emit(&mut self, event: Event) {
        match event {
            Event::Scan(ScanEvent::Token(_)) => {}
            Event::Scan(ScanEvent::Error { message, line }) => {
                println!("[scan]  erro linha {}: {}", line, message)
            }
            Event::Parse(ParseEvent::Error { message, line }) => {
                println!("[parse] erro linha {}: {}", line, message)
            }
            Event::Resolve(re) => match re {
                ResolveEvent::ScopeBegin => println!("[resolve] +-- abre escopo"),
                ResolveEvent::ScopeEnd => println!("[resolve] +-- fecha escopo"),
                ResolveEvent::Declare { name, line } => {
                    println!("[resolve]     declara '{}' (linha {})", name, line)
                }
                ResolveEvent::Define { name } => println!("[resolve]     define  '{}'", name),
                ResolveEvent::Resolve { id, name, depth } => println!(
                    "[resolve]     resolve '{}' (#{}) -> prof {}",
                    name, id, depth
                ),
                ResolveEvent::Error { message, line } => {
                    println!("[resolve] ERRO linha {}: {}", line, message)
                }
            },
        }
    }
}

fn rodar(titulo: &str, fonte: &str) {
    println!("===== {} =====", titulo);
    let sink: SharedSink = Rc::new(RefCell::new(DebugSink));
    let mut scanner = Scanner::new(fonte.to_string(), sink.clone());
    let tokens = match scanner.scan_tokens() {
        Ok(t) => t,
        Err(e) => {
            println!("[scan] erro linha {}: {}", e.line, e.message);
            return;
        }
    };
    let mut parser = Parser::new(tokens, sink.clone());
    let statements = parser.parse();
    let mut resolver = Resolver::new(sink.clone());
    match resolver.resolve(&statements) {
        Ok(()) => println!("(resolução ok)"),
        Err(e) => println!("(parou no erro da linha {}: {})", e.line, e.message),
    }
    println!();
}

fn main() {
    // escopos aninhados de verdade: classe com método, bloco dentro
    rodar(
        "aninhado",
        "classe Animal {\n  fala(som) {\n    var eco = som;\n    { var interno = eco; imprima interno; }\n  }\n}",
    );
    // erro de propósito: 'this' fora de classe -> dispara ResolveEvent::Error
    rodar("erro: este fora de classe", "imprima este;");
}
