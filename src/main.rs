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
mod value;
mod vm;

use std::cell::RefCell;
use std::rc::Rc;

use compiler::Compiler;
use events::{Event, EventSink, SharedSink};
use parser::Parser;
use scanner::Scanner;
use vm::Vm;

use crate::events::VmEvent;

struct NullSink;
impl EventSink for NullSink {
    fn emit(&mut self, _event: Event) {}
}

struct TraceSink;
impl EventSink for TraceSink {
    fn emit(&mut self, event: Event) {
        if let Event::Vm(VmEvent::Step {
            line,
            instruction,
            stack,
        }) = event
        {
            println!(
                "linha {:<2} | {:<22} | pilha: [{}]",
                line,
                instruction,
                stack.join(", ")
            );
        }
    }
}

fn run(source: &str) {
    let sink: SharedSink = Rc::new(RefCell::new(TraceSink));

    let mut scanner = Scanner::new(source.to_string(), sink.clone());
    let tokens = match scanner.scan_tokens() {
        Ok(tokens) => tokens,
        Err(error) => {
            println!("Erro na linha {}: {}", error.line, error.message);
            return;
        }
    };

    let mut parser = Parser::new(tokens, sink.clone());
    let statements = parser.parse();
    if !parser.errors.is_empty() {
        for error in &parser.errors {
            println!("Erro na linha {}: {}", error.token.line, error.message);
        }
        return;
    }

    let mut compiler = Compiler::new(sink.clone());
    compiler.compile(&statements);
    if !compiler.errors.is_empty() {
        for error in &compiler.errors {
            println!("Erro na linha {}: {}", error.line, error.message);
        }
        return;
    }
    let chunk = compiler.into_chunk();

    let mut vm = Vm::new(sink.clone());
    if let Err(error) = vm.run(&chunk) {
        println!("Erro na linha {}: {}", error.line, error.message);
    }
}

fn main() {
    run(r#"
        classe Animal {
            var nome;
            construtor(nome) {
                este.nome = nome;
            }
            apresenta() {
                imprima(este.nome);
            }
        }

        classe Cachorro < Animal {
            var raca;
            construtor(nome, raca) {
                super.construtor(nome);
                este.raca = raca;
            }
            apresenta() {
                super.apresenta();
                imprima(este.raca);
            }
        }

        var rex = Cachorro("Rex", "Poodle");
        rex.apresenta();
    "#);
}
