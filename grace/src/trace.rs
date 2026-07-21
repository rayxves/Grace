use serde::Serialize;

use crate::ast_serializer::AstNode;
use crate::events::{
    CompileEvent, Event, EventSink, ParseEvent, ResolveEvent, ScanEvent, VmEvent,
};

#[derive(Serialize)]
pub struct StepJson {
    pub line: u64,
    pub instruction: String,
    pub stack: Vec<String>,
}

#[derive(Serialize)]
struct TraceView<'a> {
    ast: &'a Option<AstNode>,
    steps: &'a Vec<StepJson>,
    error: &'a Option<String>,
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

    pub fn to_json(&self, ast: &Option<AstNode>) -> String {
        let trace = TraceView {
            ast,
            steps: &self.steps,
            error: &self.error,
        };
        serde_json::to_string_pretty(&trace).unwrap_or_else(|_| "{}".to_string())
    }
}

impl EventSink for TraceCollector {
    fn emit(&mut self, event: Event) {
        match event {
            Event::Vm(VmEvent::Step { line, instruction, stack }) => {
                self.steps.push(StepJson { line, instruction, stack });
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