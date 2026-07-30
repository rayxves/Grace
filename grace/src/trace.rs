use serde::Serialize;

use crate::ast_serializer::AstNode;
use crate::events::{CompileEvent, Event, EventSink, ParseEvent, ResolveEvent, ScanEvent, VmEvent};

#[derive(Serialize)]
pub struct VariableJson {
    pub name: String,
    pub value: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CallStackEntryJson {
    pub function_name: String,
    pub call_line: Option<u64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StepJson {
    pub offset: usize,
    pub line: u64,
    pub node_id: Option<usize>,
    pub loop_iteration: Option<usize>,
    pub instruction: String,
    pub stack: Vec<String>,
    pub popped: Vec<String>,
    pub pushed: Vec<String>,
    pub globals: Vec<VariableJson>,
    pub locals: Vec<VariableJson>,
    pub call_stack: Vec<CallStackEntryJson>,
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum ResolveStepJson {
    ScopeBegin,
    ScopeEnd,
    Declare {
        name: String,
        line: u64,
    },
    Define {
        name: String,
    },
    Resolve {
        id: usize,
        name: String,
        depth: usize,
    },
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum CompileStepJson {
    Enter {
        node_id: usize,
        node_kind: String,
        line: Option<u64>,
    },
    Exit {
        node_id: usize,
    },
    Emit {
        node_id: Option<usize>,
        offset: usize,
        opcode: String,
        line: u64,
    },
    Patch {
        offset: usize,
        target: usize,
    },
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenJson {
    pub text: String,
    pub kind: String,
    pub line: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TraceView<'a> {
    ast: &'a Option<AstNode>,
    bytecode: &'a Vec<BytecodeJson>,
    constants: &'a Vec<String>,
    steps: &'a Vec<StepJson>,
    resolve_steps: &'a Vec<ResolveStepJson>,
    compile_steps: &'a Vec<CompileStepJson>,
    tokens: &'a Vec<TokenJson>,
    error: &'a Option<String>,
    error_offset: &'a Option<usize>,
    truncated: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BytecodeJson {
    pub offset: usize,
    pub text: String,
    pub line: u64,
    pub node_id: Option<usize>,
}

// UI/JSON size cap, independent of the VM's own MAX_STEPS safety limit: a program can finish
// well within MAX_STEPS and still produce more steps than the player/scrubber should hold.
const MAX_TRACE_STEPS: usize = 5_000;

pub struct TraceCollector {
    steps: Vec<StepJson>,
    resolve_steps: Vec<ResolveStepJson>,
    compile_steps: Vec<CompileStepJson>,
    tokens: Vec<TokenJson>,
    error: Option<String>,
    error_offset: Option<usize>,
    truncated: bool,
}

impl TraceCollector {
    pub fn new() -> TraceCollector {
        TraceCollector {
            steps: Vec::new(),
            resolve_steps: Vec::new(),
            compile_steps: Vec::new(),
            tokens: Vec::new(),
            error: None,
            error_offset: None,
            truncated: false,
        }
    }

    pub fn to_json(
        &self,
        ast: &Option<AstNode>,
        bytecode: &Vec<BytecodeJson>,
        constants: &Vec<String>,
    ) -> String {
        let trace = TraceView {
            ast,
            bytecode,
            constants,
            steps: &self.steps,
            resolve_steps: &self.resolve_steps,
            compile_steps: &self.compile_steps,
            tokens: &self.tokens,
            error: &self.error,
            error_offset: &self.error_offset,
            truncated: self.truncated,
        };
        serde_json::to_string_pretty(&trace).unwrap_or_else(|_| "{}".to_string())
    }
}

impl EventSink for TraceCollector {
    fn emit(&mut self, event: Event) {
        match event {
            Event::Scan(ScanEvent::Token(token)) => {
                self.tokens.push(TokenJson {
                    text: token.lexeme,
                    kind: format!("{:?}", token.token_type),
                    line: token.line,
                });
            }
            Event::Compile(CompileEvent::EnterNode {
                node_id,
                node_kind,
                line,
            }) => {
                self.compile_steps.push(CompileStepJson::Enter {
                    node_id,
                    node_kind,
                    line,
                });
            }
            Event::Compile(CompileEvent::ExitNode { node_id }) => {
                self.compile_steps.push(CompileStepJson::Exit { node_id });
            }
            Event::Compile(CompileEvent::Emit {
                node_id,
                offset,
                opcode,
                line,
            }) => {
                self.compile_steps.push(CompileStepJson::Emit {
                    node_id,
                    offset,
                    opcode,
                    line,
                });
            }
            Event::Compile(CompileEvent::Patch { offset, target }) => {
                self.compile_steps
                    .push(CompileStepJson::Patch { offset, target });
            }
            Event::Vm(VmEvent::Step {
                offset,
                line,
                node_id,
                loop_iteration,
                instruction,
                stack,
                popped,
                pushed,
                globals,
                locals,
                call_stack,
            }) => {
                if self.steps.len() >= MAX_TRACE_STEPS {
                    self.truncated = true;
                    return;
                }
                self.steps.push(StepJson {
                    offset,
                    line,
                    node_id,
                    loop_iteration,
                    instruction,
                    stack,
                    popped,
                    pushed,
                    globals: globals
                        .into_iter()
                        .map(|(name, value)| VariableJson { name, value })
                        .collect(),
                    locals: locals
                        .into_iter()
                        .map(|(name, value)| VariableJson { name, value })
                        .collect(),
                    call_stack: call_stack
                        .into_iter()
                        .map(|(function_name, call_line)| CallStackEntryJson {
                            function_name,
                            call_line,
                        })
                        .collect(),
                });
            }
            Event::Vm(VmEvent::Error {
                message,
                line,
                offset,
            }) => {
                if self.error.is_none() {
                    self.error = Some(format!("Linha {}: {}", line, message));
                    self.error_offset = Some(offset);
                }
            }
            Event::Scan(ScanEvent::Error { message, line })
            | Event::Parse(ParseEvent::Error { message, line })
            | Event::Resolve(ResolveEvent::Error { message, line })
            | Event::Compile(CompileEvent::Error { message, line }) => {
                if self.error.is_none() {
                    self.error = Some(format!("Linha {}: {}", line, message));
                }
            }
            Event::Resolve(ResolveEvent::ScopeBegin) => {
                self.resolve_steps.push(ResolveStepJson::ScopeBegin);
            }
            Event::Resolve(ResolveEvent::ScopeEnd) => {
                self.resolve_steps.push(ResolveStepJson::ScopeEnd);
            }
            Event::Resolve(ResolveEvent::Declare { name, line }) => {
                self.resolve_steps.push(ResolveStepJson::Declare { name, line });
            }
            Event::Resolve(ResolveEvent::Define { name }) => {
                self.resolve_steps.push(ResolveStepJson::Define { name });
            }
            Event::Resolve(ResolveEvent::Resolve { id, name, depth }) => {
                self.resolve_steps
                    .push(ResolveStepJson::Resolve { id, name, depth });
            }
            _ => {}
        }
    }
}
