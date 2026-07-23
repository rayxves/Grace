mod expressions;
mod statements;

use std::{collections::HashMap, rc::Rc};

use crate::{
    chunk::{Chunk, LocalRange, opcode::OpCode},
    events::{CompileEvent, Event::Compile, SharedSink},
    stmt::Statement,
    value::{Class, Value, function::Function},
};

#[derive(Debug, Clone)]
pub struct CompileError {
    pub message: String,
    pub line: u64,
}

impl CompileError {
    pub fn new(message: String, line: u64) -> CompileError {
        CompileError { message, line }
    }
}

pub struct Locals {
    name: String,
    depth: usize,
    slot: usize,
    start_offset: usize,
}

struct NodeGuard {
    sink: SharedSink,
    node_id: usize,
}

impl Drop for NodeGuard {
    fn drop(&mut self) {
        self.sink.borrow_mut().emit(Compile(CompileEvent::ExitNode {
            node_id: self.node_id,
        }));
    }
}

pub struct Compiler {
    pub(crate) chunk: Chunk,
    pub(crate) sink: SharedSink,
    pub(crate) locals: Vec<Locals>,
    pub(crate) scope_depth: usize,
    pub errors: Vec<CompileError>,
    pub(crate) classes: HashMap<String, Rc<Class>>,
    pub(crate) current_class: Option<Rc<Class>>,
}

impl Compiler {
    pub fn new(sink: SharedSink) -> Compiler {
        Compiler {
            chunk: Chunk::new(),
            sink,
            locals: vec![Locals {
                name: String::new(),
                depth: 0,
                slot: 0,
                start_offset: 0,
            }],
            scope_depth: 0,
            errors: Vec::new(),
            classes: HashMap::new(),
            current_class: None,
        }
    }

    pub fn error(&mut self, message: String, line: u64) {
        let error = CompileError::new(message, line);
        self.errors.push(error.clone());
        self.sink.borrow_mut().emit(Compile(CompileEvent::Error {
            message: error.message,
            line: error.line,
        }));
    }

    fn enter_node(&mut self, node_id: usize, kind: &str, line: Option<u64>) -> NodeGuard {
        self.sink.borrow_mut().emit(Compile(CompileEvent::EnterNode {
            node_id,
            node_kind: kind.to_string(),
            line,
        }));
        NodeGuard {
            sink: self.sink.clone(),
            node_id,
        }
    }

    pub fn emit_op(&mut self, opcode: OpCode, line: u64, node_id: Option<usize>) {
        let offset = self.chunk.code.len();
        self.chunk.append(opcode as u8, line, node_id);
        self.sink.borrow_mut().emit(Compile(CompileEvent::Emit {
            node_id,
            offset,
            opcode: opcode.description(),
            line,
        }));
    }

    pub fn emit_with_operand(
        &mut self,
        opcode: OpCode,
        operand: u8,
        line: u64,
        node_id: Option<usize>,
    ) {
        self.emit_op(opcode, line, node_id);
        self.chunk.append(operand, line, node_id);
    }

    pub fn emit_constant(&mut self, value: Value, line: u64, node_id: Option<usize>) {
        let index = self.chunk.add_constant(value);
        self.emit_with_operand(OpCode::Constant, index as u8, line, node_id);
    }

    pub fn emit_named(&mut self, opcode: OpCode, value: Value, line: u64, node_id: Option<usize>) {
        let index = self.chunk.add_constant(value);
        self.emit_with_operand(opcode, index as u8, line, node_id);
    }

    pub fn emit_jump(&mut self, opcode: OpCode, line: u64, node_id: Option<usize>) -> usize {
        self.emit_op(opcode, line, node_id);
        self.chunk.append(0xff, line, node_id);
        self.chunk.code.len() - 1
    }

    pub fn patch_jump(&mut self, placeholder: usize) {
        let jump = self.chunk.code.len() - placeholder - 1;
        self.chunk.code[placeholder] = jump as u8;
        let target = self.chunk.code.len();
        self.sink.borrow_mut().emit(Compile(CompileEvent::Patch {
            offset: placeholder,
            target,
        }));
    }

    pub fn emit_loop(&mut self, loop_start: usize, line: u64, node_id: Option<usize>) {
        self.emit_op(OpCode::Loop, line, node_id);
        let offset = self.chunk.code.len() + 1 - loop_start;
        self.chunk.append(offset as u8, line, node_id);
    }

    pub fn begin_scope(&mut self) {
        self.scope_depth += 1;
    }

    pub fn end_scope(&mut self, line: u64, node_id: Option<usize>) {
        self.scope_depth -= 1;
        while let Some(local) = self.locals.last() {
            if local.depth <= self.scope_depth {
                break;
            }
            let name = local.name.clone();
            let slot = local.slot;
            let start_offset = local.start_offset;
            self.emit_op(OpCode::Pop, line, node_id);
            let end_offset = self.chunk.code.len();
            self.chunk.local_ranges.push(LocalRange {
                name,
                slot,
                start: start_offset,
                end: end_offset,
            });
            self.locals.pop();
        }
    }

    pub fn add_local(&mut self, name: String) {
        let slot = self.locals.len();
        let start_offset = self.chunk.code.len();
        self.locals.push(Locals {
            name,
            depth: self.scope_depth,
            slot,
            start_offset,
        });
    }

    pub fn resolve_local(&self, name: &str) -> Option<usize> {
        for i in (0..self.locals.len()).rev() {
            if self.locals[i].name == name {
                return Some(i);
            }
        }
        None
    }

    pub fn compile(&mut self, statements: &Vec<Statement>) {
        for stmt in statements {
            stmt.accept(self);
        }
        let last_line = statements.last().map(|s| s.line()).unwrap_or(1);
        self.emit_op(OpCode::Return, last_line, None);
    }

    pub fn into_chunk(self) -> Chunk {
        self.chunk
    }

    pub(crate) fn compile_function(
        &mut self,
        name: &str,
        params: &Vec<String>,
        body: &Vec<Statement>,
        line: u64,
    ) -> Function {
        let mut fn_compiler = Compiler::new(self.sink.clone());
        fn_compiler.classes = self.classes.clone();
        fn_compiler.current_class = self.current_class.clone();

        fn_compiler.begin_scope();
        for param in params {
            fn_compiler.add_local(param.to_string());
        }
        for stmt in body {
            stmt.accept(&mut fn_compiler);
        }

        let end_line = body.last().map(|s| s.line()).unwrap_or(line);
        if name == "construtor" {
            fn_compiler.emit_with_operand(OpCode::GetLocal, 0, end_line, None);
        } else {
            fn_compiler.emit_op(OpCode::Null, end_line, None);
        }
        fn_compiler.emit_op(OpCode::Return, end_line, None);

        let fn_end = fn_compiler.chunk.code.len();
        for local in &fn_compiler.locals {
            fn_compiler.chunk.local_ranges.push(LocalRange {
                name: local.name.clone(),
                slot: local.slot,
                start: local.start_offset,
                end: fn_end,
            });
        }

        let fn_errors = fn_compiler.errors.clone();
        self.errors.extend(fn_errors);

        let fn_chunk = fn_compiler.into_chunk();
        Function::new(name.to_string(), params.len() as u64, fn_chunk)
    }
}