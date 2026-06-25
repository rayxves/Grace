use crate::token::{KEYWORDS, TokenError};
use crate::token::{Token, TokenType};

pub struct Scanner {
    start: u64,
    current: u64,
    line: u64,
    source: String,
}

impl Scanner {
    pub fn new(source: String) -> Scanner {
        Scanner {
            start: 0,
            current: 0,
            line: 1,
            source,
        }
    }

    fn is_at_end(&self) -> bool {
        self.current as usize >= self.source.len()
    }

    fn advance(&mut self) -> char {
        let c = self.source[self.current as usize..].chars().next().unwrap();
        self.current += c.len_utf8() as u64;
        c
    }

    fn peek(&self) -> char {
        if self.is_at_end() {
            return '\0';
        }
        self.source[self.current as usize..].chars().next().unwrap()
    }

    fn peek_next(&self) -> char {
        let current_char = self.source[self.current as usize..].chars().next();
        match current_char {
            Some(ch) => {
                let current_char_len = ch.len_utf8() as usize;

                if self.current as usize + current_char_len >= self.source.len() {
                    return '\0';
                }
                self.source[self.current as usize + current_char_len..]
                    .chars()
                    .next()
                    .unwrap()
            }
            None => '\0',
        }
    }

    fn match_next(&mut self, expected: char) -> bool {
        if self.is_at_end() {
            return false;
        }
        if self.peek() != expected {
            return false;
        }
        self.current += expected.len_utf8() as u64;
        true
    }

    fn make_token(&self, token_type: TokenType) -> Token {
        let lexeme = self.source[self.start as usize..self.current as usize].to_owned();
        Token::new(token_type, lexeme, self.line)
    }

    fn string(&mut self) -> Result<Token, TokenError> {
        while self.peek() != '"' && !self.is_at_end() {
            if self.peek() == '\n' {
                self.line += 1
            }
            self.advance();
        }
        if self.is_at_end() {
            return Err(TokenError::new("O texto iniciado com '\"' nunca foi fechado. Dica: todo texto precisa começar e terminar com aspas, por exemplo: \"olá mundo\"".to_string(),
                self.line,
            ));
        }
        self.advance();
        let lexeme = self.source[self.start as usize + 1..self.current as usize - 1].to_owned();
        Ok(self.make_token(TokenType::StringLiteral(lexeme)))
    }

    fn is_alpha(&self, c: char) -> bool {
        c.is_alphabetic() || c == '_'
    }

    fn is_alpha_numeric(&self, c: char) -> bool {
        return self.is_alpha(c) | self.is_digit(c);
    }

    fn identifier(&mut self) -> Token {
        while self.is_alpha_numeric(self.peek()) {
            self.advance();
        }
        let lexeme = self.source[self.start as usize..self.current as usize].to_owned();
        let token_type = KEYWORDS.get(&lexeme as &str);
        match token_type {
            Some(keyword) => self.make_token(keyword.clone()),
            None => self.make_token(TokenType::Identifier(lexeme)),
        }
    }

    fn is_digit(&self, c: char) -> bool {
        return matches!(c, '0'..='9');
    }

    fn number(&mut self) -> Token {
        while self.is_digit(self.peek()) {
            self.advance();
        }

        if self.peek() == '.' && self.is_digit(self.peek_next()) {
            self.advance();

            while self.is_digit(self.peek()) {
                self.advance();
            }
        }

        let lexeme = self.source[self.start as usize..self.current as usize].to_owned();
        self.make_token(TokenType::Number(lexeme.parse::<f64>().unwrap()))
    }

    fn skip_whitespace(&mut self) {
        let ch = self.peek();
        if ch == ' ' || ch == '\t' || ch == '\r'{
            self.advance();
        } else if ch == '\n' {
            self.line += 1;
            self.advance();
        } else if ch == '/' {

            if self.peek_next() == '/' {
                while !self.is_at_end() && self.peek() != '\n' {
                    self.advance();
                }
            }
        }
    }

    pub fn scan_token(&mut self) -> Result<Token, TokenError> {
        self.skip_whitespace();
        self.start = self.current;
        if self.is_at_end() {
            return Ok(self.make_token(TokenType::EOF));
        }
        let c = self.advance();
        match c {
            '(' => Ok(self.make_token(TokenType::LeftParen)),
            ')' => Ok(self.make_token(TokenType::RightParen)),
            '{' => Ok(self.make_token(TokenType::LeftBrace)),
            '}' => Ok(self.make_token(TokenType::RightBrace)),
            ',' => Ok(self.make_token(TokenType::Comma)),
            '.' => Ok(self.make_token(TokenType::Dot)),
            ';' => Ok(self.make_token(TokenType::Semicolon)),
            '*' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::StarEqual))
                } else {
                    Ok(self.make_token(TokenType::Star))
                }
            }
            '+' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::PlusEqual))
                } else {
                    Ok(self.make_token(TokenType::Plus))
                }
            }
            '-' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::MinusEqual))
                } else {
                    Ok(self.make_token(TokenType::Minus))
                }
            }
            '/' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::SlashEqual))
                } else {
                    Ok(self.make_token(TokenType::Slash))
                }
            }
            '=' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::EqualEqual))
                } else {
                    Ok(self.make_token(TokenType::Equal))
                }
            }
            '!' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::BangEqual))
                } else {
                    Ok(self.make_token(TokenType::Bang))
                }
            }
            '>' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::GreaterEqual))
                } else {
                    Ok(self.make_token(TokenType::Greater))
                }
            }
            '<' => {
                if self.match_next('=') {
                    Ok(self.make_token(TokenType::LessEqual))
                } else {
                    Ok(self.make_token(TokenType::Less))
                }
            }
            '"' => self.string(),
            '0'..='9' => {
                if self.is_alpha(self.peek()) {
                    return Err(TokenError::new(
                        format!(
                            "O número '{}' não pode ser seguido de letras.\n\
         Dica: nomes de variáveis não podem começar com números.",
                            c
                        ),
                        self.line,
                    ));
                } else {
                    Ok(self.number())
                }
            }
            'a'..='z' | 'A'..='Z' | '_' => Ok(self.identifier()),

            _ => {
                if self.is_alpha(c) {
                    Ok(self.identifier())
                } else {
                    return Err(TokenError::new(
                        format!(
                            "O caractere '{}' não é reconhecido pela linguagem Grace.\n\
     Dica: verifique se não há um símbolo digitado por engano.",
                            c
                        ),
                        self.line,
                    ));
                }
            }
        }
    }
}
