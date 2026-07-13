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
    println!("### {}", rotulo);
    let sink: SharedSink = Rc::new(RefCell::new(NullSink));

    let mut scanner = Scanner::new(fonte.to_string(), sink.clone());
    let tokens = match scanner.scan_tokens() {
        Ok(t) => t,
        Err(e) => { println!("erro léxico: {}\n", e.message); return; }
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
    roda("função simples", "funcao dobro(n) { retorna n * 2; } imprima dobro(5);");
    roda("sem retorno (Nulo)", "funcao oi(n) { imprima n; } oi(9);");
    roda("dois argumentos", "funcao soma(a, b) { retorna a + b; } imprima soma(3, 4);");
    roda("chamada aninhada", "funcao dobro(n) { retorna n * 2; } imprima dobro(dobro(3));");
    roda("função chama função", "funcao inc(x){retorna x+1;} funcao dobro(n){retorna inc(n)*2;} imprima dobro(4);");
    roda("recursão fatorial", "funcao fat(n) { se (n <= 1) retorna 1; retorna n * fat(n - 1); } imprima fat(5);");
    roda("recursão fibonacci", "funcao fib(n){ se (n < 2) retorna n; retorna fib(n-1) + fib(n-2); } imprima fib(10);");
    roda("global na função", "var base = 100; funcao maisBase(x) { retorna x + base; } imprima maisBase(7);");
    roda("local + parâmetro", "funcao calc(x) { var y = 10; retorna x + y; } imprima calc(5);");
    roda("função com laço", "funcao somaAte(n) { var s = 0; var i = 1; enquanto (i <= n) { s = s + i; i = i + 1; } retorna s; } imprima somaAte(5);");
    roda("erro de aridade", "funcao f(a, b) { retorna a; } imprima f(1);");
}