# Grace — plataforma web

Visualizador de execução da linguagem Grace: editor de código, árvore sintática (AST), bytecode e pilha de execução, sincronizados passo a passo através de um player.

Vite + React 19 + TypeScript. Veja o [README na raiz do repositório](../README.md) para como reconstruir o WASM que este projeto consome.

## Rodando

```
npm install
npm run dev
```

## Estrutura

```
src/
  components/   um componente por tela (CodeEditor, AstView, BytecodeView, StackView, Toolbar...)
  hooks/        usePlayer (controla a reprodução), useTheme
  lib/          wrapper do WASM, lógica de negócio pura (sem JSX)
  styles/       variáveis de tema (claro/escuro), CSS global
  types.ts      contrato de dados com a Grace (não altere sem sincronizar com grace/src)
```
