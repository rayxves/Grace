use std::collections::HashMap;
use std::sync::LazyLock;

#[derive(Debug, PartialEq, Clone)]
pub enum TokenType {
    LeftParen,
    RightParen,
    LeftBrace,
    RightBrace,
    Comma,
    Dot,
    Semicolon,
    Star,

    Plus,
    Minus,
    Slash,

    PlusEqual,
    MinusEqual,
    SlashEqual,
    StarEqual,

    Bang,
    BangEqual,
    Equal,
    EqualEqual,
    Greater,
    GreaterEqual,
    Less,
    LessEqual,

    Identifier(String),
    StringLiteral(String),
    Number(f64),
    Boolean(bool),

    And,
    Class,
    Else,
    If,
    Function,
    For,
    Null,
    Or,
    Print,
    Return,
    Super,
    This,
    Var,
    While,
    Constructor,

    EOF,
}

pub struct TokenError {
    pub message: String,
    pub line: u64,
}

#[derive(Debug, PartialEq, Clone)]
pub enum TokenLiteral {
    StringLiteral(String),
    Number(f64),
    Boolean(bool),
    Null,
}

#[derive(Debug, PartialEq, Clone)]
pub enum UnaryOp {
    Minus,
    Bang,
}

#[derive(Debug, PartialEq, Clone)]
pub enum LogicalOp {
    And,
    Or,
}

#[derive(Debug, PartialEq, Clone)]
pub enum BinaryOp {
    Star,
    Plus,
    Minus,
    Slash,
    EqualEqual,
    Greater,
    GreaterEqual,
    Less,
    LessEqual,
    BangEqual,
}

pub static KEYWORDS: LazyLock<HashMap<&str, TokenType>> = LazyLock::new(|| {
    HashMap::from([
        ("var", TokenType::Var),
        ("se", TokenType::If),
        ("senao", TokenType::Else),
        ("retorna", TokenType::Return),
        ("enquanto", TokenType::While),
        ("para", TokenType::For),
        ("imprima", TokenType::Print),
        ("nulo", TokenType::Null),
        ("classe", TokenType::Class),
        ("funcao", TokenType::Function),
        ("ou", TokenType::Or),
        ("e", TokenType::And),
        ("super", TokenType::Super),
        ("este", TokenType::This),
        ("verdadeiro", TokenType::Boolean(true)),
        ("falso", TokenType::Boolean(false)),
        ("construtor", TokenType::Constructor),
    ])
});

#[derive(Debug, PartialEq, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub lexeme: String,
    pub line: u64,
}

impl Token {
    pub fn new(token_type: TokenType, lexeme: String, line: u64) -> Token {
        Token {
            token_type,
            lexeme,
            line,
        }
    }
}

impl TokenError {
    pub fn new(message: String, line: u64) -> TokenError {
        TokenError { message, line }
    }
}
