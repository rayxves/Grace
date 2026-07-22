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
#[serde(rename_all = "camelCase")]
struct TraceView<'a> {
    ast: &'a Option<AstNode>,
    bytecode: &'a Vec<BytecodeJson>,
    steps: &'a Vec<StepJson>,
    error: &'a Option<String>,
    error_offset: &'a Option<usize>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BytecodeJson {
    pub offset: usize,
    pub text: String,
    pub line: u64,
    pub node_id: Option<usize>,
}

pub struct TraceCollector {
    steps: Vec<StepJson>,
    error: Option<String>,
    error_offset: Option<usize>,
}

impl TraceCollector {
    pub fn new() -> TraceCollector {
        TraceCollector {
            steps: Vec::new(),
            error: None,
            error_offset: None,
        }
    }

    pub fn to_json(&self, ast: &Option<AstNode>, bytecode: &Vec<BytecodeJson>) -> String {
        let trace = TraceView {
            ast,
            bytecode,
            steps: &self.steps,
            error: &self.error,
            error_offset: &self.error_offset,
        };
        serde_json::to_string_pretty(&trace).unwrap_or_else(|_| "{}".to_string())
    }
}

impl EventSink for TraceCollector {
    fn emit(&mut self, event: Event) {
        match event {
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
            _ => {}
        }
    }
}
