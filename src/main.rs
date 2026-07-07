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

fn roda(rotulo: &str, fonte: &str) {
    println!("### {}   |   {}", rotulo, fonte);
    let sink: SharedSink = Rc::new(RefCell::new(NullSink));

    let mut scanner = Scanner::new(fonte.to_string(), sink.clone());
    let tokens = match scanner.scan_tokens() {
        Ok(t) => t,
        Err(e) => { println!("erro léxico: {}", e.message); println!(); return; }
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
    println!();
}

fn main() {
    // local básico
    roda("local simples", "{ var a = 1; var b = 2; imprima a + b; }");            // 3
    // o de dentro enxerga o de fora
    roda("aninhado", "{ var a = 10; { var b = 20; imprima a + b; } imprima a; }"); // 30, depois 10
    // SOMBREAMENTO — o teste decisivo
    roda("sombreamento", "{ var a = 1; { var a = 2; imprima a; } imprima a; }");   // 2, depois 1
    // local e global convivendo
    roda("local + global", "var g = 100; { var l = 5; imprima g + l; }");          // 105
    // atribuir a uma local
    roda("atribui local", "{ var a = 1; a = a + 5; imprima a; }");                 // 6
    // laço usando locais
    roda("laço com local", "{ var soma = 0; var i = 1; enquanto (i <= 3) { soma = soma + i; i = i + 1; } imprima soma; }"); // 6
    // global ainda funciona sozinha
    roda("global puro", "var x = 7; imprima x; x = x + 1; imprima x;");            // 7, depois 8
}