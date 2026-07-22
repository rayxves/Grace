# Grace

Grace é uma linguagem de programação com sintaxe em português, escrita em Rust e compilada para WebAssembly. Este repositório tem duas partes:

```
grace/   a linguagem: scanner, parser, resolver, compilador, VM, e o binding WASM (pkg/)
web/     a plataforma web de visualização: Vite + React + TypeScript
```

## Como rodar a plataforma web

```
cd web
npm install
npm run dev
```

O frontend importa o WASM compilado diretamente de `grace/pkg/Grace.js` por caminho relativo — não precisa rodar nada em `grace/` para isso funcionar, desde que `grace/pkg` já esteja presente (ele é commitado intencionalmente).

## Como reconstruir o WASM

`grace/pkg` **não é gerado automaticamente** a partir de `grace/src`. Sempre que você alterar algo em `grace/src/`, é preciso reconstruir manualmente:

```
cd grace
wasm-pack build --target web
```

Isso regenera `grace/pkg/Grace.js`, `Grace_bg.wasm` e os `.d.ts`. Sem esse passo, `grace/pkg` fica dessincronizado do `grace/src` silenciosamente — o frontend continua rodando, só que com um binário antigo. Requer [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/) instalado (`cargo install wasm-pack` ou o instalador oficial).

## Rodando só a linguagem (sem o WASM)

```
cd grace
cargo build
```

Não há suíte de testes automatizada no crate ainda.
