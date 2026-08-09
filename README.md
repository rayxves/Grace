# GHopper

GHopper é uma linguagem de programação com sintaxe em português, escrita em Rust e compilada para WebAssembly — e um visualizador interativo de como um compilador e uma máquina virtual funcionam por dentro. A plataforma web acompanha, passo a passo, todas as fases reais do pipeline: análise léxica (tokens), análise sintática (AST), resolução de escopos e variáveis, geração de bytecode e execução na VM (pilha, variáveis, frames de chamada).

Este repositório tem duas partes:

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

O frontend importa o WASM compilado diretamente de `grace/pkg/GHopper.js` por caminho relativo — não precisa rodar nada em `grace/` para isso funcionar, desde que `grace/pkg` já esteja presente (ele é commitado intencionalmente).

## Como reconstruir o WASM

`grace/pkg` **não é gerado automaticamente** a partir de `grace/src`. Sempre que você alterar algo em `grace/src/`, é preciso reconstruir manualmente:

```
cd grace
wasm-pack build --target web
```

Isso regenera `grace/pkg/GHopper.js`, `GHopper_bg.wasm` e os `.d.ts`. Sem esse passo, `grace/pkg` fica dessincronizado do `grace/src` silenciosamente — o frontend continua rodando, só que com um binário antigo. Requer [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/) instalado (`cargo install wasm-pack` ou o instalador oficial).

Para checar se isso já aconteceu, `cd web && npm run check:wasm` compara a data de modificação de `grace/pkg` com a de `grace/src` e falha se o pacote parecer mais antigo que o código-fonte.

## Rodando só a linguagem (sem o WASM)

```
cd grace
cargo build
cargo test
```

Os testes em `grace/tests/` travam as afirmações didáticas usadas na interface (bytecode gerado, curto-circuito, resolução de escopos, erros) — se uma delas parar de valer, o teste correspondente falha.
