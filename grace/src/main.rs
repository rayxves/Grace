use Grace::gera_trace;

fn main() {
    let json = gera_trace("var x = 10;\nimprima(x + 5);");
    println!("{}", json);
}