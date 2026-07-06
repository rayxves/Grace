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
    print!("{:<42} -> ", fonte);
    let sink: SharedSink = Rc::new(RefCell::new(NullSink));

    let mut scanner = Scanner::new(fonte.to_string(), sink.clone());
    let tokens = scanner.scan_tokens().ok().unwrap();

    let mut parser = Parser::new(tokens, sink.clone());
    let statements = parser.parse();

    let mut compiler = Compiler::new(sink.clone());
    compiler.compile(&statements);
    let chunk = compiler.into_chunk();

    let mut vm = Vm::new();
    if let Err(e) = vm.run(&chunk) {
        println!("erro: {}", e.message);
    }
}

fn main() {
    println!("--- se / enquanto (não podem ter quebrado) ---");
    roda("var i = 0; enquanto (i < 3) { imprima i; i = i + 1; }");
    roda("se (2 == 2) imprima 100; senao imprima 200;");
    roda("se (2 == 3) imprima 100; senao imprima 200;");
    roda("se (falso) imprima 1;");                 // sem senao, não pode deixar lixo

    println!("--- e / ou ---");
    roda("imprima verdadeiro e verdadeiro;");
    roda("imprima verdadeiro e falso;");
    roda("imprima falso e verdadeiro;");
    roda("imprima falso ou verdadeiro;");
    roda("imprima falso ou falso;");
    roda("imprima verdadeiro ou falso;");

    println!("--- curto-circuito (o lado direito NÃO deve rodar) ---");
    roda("imprima falso e (1 / 0 == 0);");         // se rodar o 1/0, dá erro de divisão
    roda("imprima verdadeiro ou (1 / 0 == 0);");

    println!("--- valor retornado (não só bool) ---");
    roda("imprima 5 e 9;");                          // deve dar 9
    roda("imprima nulo ou 42;");                     // deve dar 42
}