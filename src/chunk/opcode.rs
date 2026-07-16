#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OperandKind {
    None,
    PoolIndex,
    Slot,
    ArgCount,
    JumpOffset,
}

#[repr(u8)]
#[derive(Debug, Clone, Copy)]
pub enum OpCode {
    Return,
    Constant,
    Negate,
    Add,
    Subtract,
    Multiply,
    Divide,
    Print,
    Pop,
    DefineGlobal,
    GetGlobal,
    SetGlobal,
    True,
    False,
    Null,
    Not,
    Equal,
    Greater,
    Less,
    Jump,
    JumpIfFalse,
    Loop,
    GetLocal,
    SetLocal,
    Call,
    GetProperty,
    SetProperty,
    GetSuper,
}

pub enum BinaryOpCode {
    Add,
    Subtract,
    Multiply,
}

impl OpCode {
    pub fn from_byte(byte: u8) -> Option<OpCode> {
        match byte {
            0 => Some(OpCode::Return),
            1 => Some(OpCode::Constant),
            2 => Some(OpCode::Negate),
            3 => Some(OpCode::Add),
            4 => Some(OpCode::Subtract),
            5 => Some(OpCode::Multiply),
            6 => Some(OpCode::Divide),
            7 => Some(OpCode::Print),
            8 => Some(OpCode::Pop),
            9 => Some(OpCode::DefineGlobal),
            10 => Some(OpCode::GetGlobal),
            11 => Some(OpCode::SetGlobal),
            12 => Some(OpCode::True),
            13 => Some(OpCode::False),
            14 => Some(OpCode::Null),
            15 => Some(OpCode::Not),
            16 => Some(OpCode::Equal),
            17 => Some(OpCode::Greater),
            18 => Some(OpCode::Less),
            19 => Some(OpCode::Jump),
            20 => Some(OpCode::JumpIfFalse),
            21 => Some(OpCode::Loop),
            22 => Some(OpCode::GetLocal),
            23 => Some(OpCode::SetLocal),
            24 => Some(OpCode::Call),
            25 => Some(OpCode::GetProperty),
            26 => Some(OpCode::SetProperty),
            27 => Some(OpCode::GetSuper),
            _ => None,
        }
    }

    pub fn description(&self) -> String {
        let name = match self {
            OpCode::Return => "retorna",
            OpCode::Constant => "constante",
            OpCode::Negate => "nega número",
            OpCode::Add => "soma",
            OpCode::Subtract => "subtrai",
            OpCode::Multiply => "multiplica",
            OpCode::Divide => "divide",
            OpCode::Print => "imprime",
            OpCode::Pop => "descarta topo",
            OpCode::DefineGlobal => "define global",
            OpCode::GetGlobal => "lê global",
            OpCode::SetGlobal => "atribui global",
            OpCode::True => "verdadeiro",
            OpCode::False => "falso",
            OpCode::Null => "nulo",
            OpCode::Not => "nega lógico",
            OpCode::Equal => "igual",
            OpCode::Greater => "maior",
            OpCode::Less => "menor",
            OpCode::Jump => "salta",
            OpCode::JumpIfFalse => "salta se falso",
            OpCode::Loop => "volta (laço)",
            OpCode::GetLocal => "lê local",
            OpCode::SetLocal => "atribui local",
            OpCode::Call => "chama",
            OpCode::GetProperty => "lê atributo",
            OpCode::SetProperty => "atribui atributo",
            OpCode::GetSuper => "lê método da superclasse",
        };
        name.to_string()
    }

    pub fn operand_kind(&self) -> OperandKind {
        match self {
            OpCode::Constant
            | OpCode::DefineGlobal
            | OpCode::GetGlobal
            | OpCode::SetGlobal
            | OpCode::GetProperty
            | OpCode::SetProperty
            | OpCode::GetSuper => OperandKind::PoolIndex,

            OpCode::GetLocal | OpCode::SetLocal => OperandKind::Slot,

            OpCode::Call => OperandKind::ArgCount,

            OpCode::Jump | OpCode::JumpIfFalse | OpCode::Loop => OperandKind::JumpOffset,

            _ => OperandKind::None,
        }
    }

    pub fn size(&self) -> usize {
        match self.operand_kind() {
            OperandKind::None => 1,
            _ => 2,
        }
    }
}