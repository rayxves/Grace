use serde::Serialize;

use crate::ast_serializer::AstNode;
use crate::events::{CompileEvent, Event, EventSink, ParseEvent, ResolveEvent, ScanEvent, VmEvent};

#[derive(Serialize)]
pub struct StepJson {
    pub offset: usize,
    pub line: u64,
    pub instruction: String,
    pub stack: Vec<String>,
}

#[derive(Serialize)]
struct TraceView<'a> {
    ast: &'a Option<AstNode>,
    bytecode: &'a Vec<BytecodeJson>,
    steps: &'a Vec<StepJson>,
    error: &'a Option<String>,
}

#[derive(Serialize)]
pub struct BytecodeJson {
    pub offset: usize,
    pub text: String,
    pub line: u64,
}

pub struct TraceCollector {
    steps: Vec<StepJson>,
    error: Option<String>,
}

impl TraceCollector {
    pub fn new() -> TraceCollector {
        TraceCollector {
            steps: Vec::new(),
            error: None,
        }
    }

    pub fn to_json(&self, ast: &Option<AstNode>, bytecode: &Vec<BytecodeJson>) -> String {
        let trace = TraceView {
            ast,
            bytecode,
            steps: &self.steps,
            error: &self.error,
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
                instruction,
                stack,
            }) => {
                self.steps.push(StepJson {
                    offset,
                    line,
                    instruction,
                    stack,
                });
            }
            Event::Vm(VmEvent::Error { message, line })
            | Event::Scan(ScanEvent::Error { message, line })
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
