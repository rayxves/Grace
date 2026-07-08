mod token; mod events; mod scanner; mod expr; mod stmt; mod parser; mod ast_serializer; mod resolver;
mod value; mod chunk; mod vm; mod compiler;

use std::cell::RefCell;
use std::rc::Rc;

use scanner::Scanner;
use parser::Parser;
use compiler::Compiler;
use vm::Vm;
use events::{Event, EventSink, SharedSink};

struct NullSink;
impl EventSink for NullSink {
    fn emit(&mut self, _e: Event) {}
}

fn roda(fonte: &str) {
    print!("{:<52} -> ", fonte);
    let sink: SharedSink = Rc::new(RefCell::new(NullSink));

    let mut scanner = Scanner::new(fonte.to_string(), sink.clone());
    let tokens = match scanner.scan_tokens() {
        Ok(t) => t,
        Err(e) => { println!("erro léxico: {}", e.message); return; }
    };

    let mut parser = Parser::new(tokens, sink.clone());
    let statements = parser.parse();

    let mut compiler = Compiler::new(sink.clone());
    compiler.compile(&statements);
    let chunk = compiler.into_chunk();

    let mut vm = Vm::new();
    if let Err(e) = vm.run(&chunk) {
        println!("erro VM: {}", e.message);
    }
}

fn main() {
    println!("=== Etapa 3a: a VM reformada roda tudo que já funcionava? ===");
    roda("imprima 1 + 2;");                                          // 3
    roda("imprima (1.2 + 3.4) / 5.6;");                             // 0.8214...
    roda("var x = 10; imprima x; x = x + 5; imprima x;");           // 10, 15
    roda("se (2 == 2) imprima 100; senao imprima 200;");            // 100
    roda("var i = 0; enquanto (i < 3) { imprima i; i = i + 1; }");  // 0, 1, 2
    roda("{ var a = 1; { var a = 2; imprima a; } imprima a; }");    // 2, 1
    roda("imprima verdadeiro e falso;");                            // Falso
    roda("imprima falso ou verdadeiro;");                           // Verdadeiro
}