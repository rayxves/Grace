use serde_json::Value;

fn trace(source: &str) -> Value {
    let json = GHopper::gera_trace(source);
    serde_json::from_str(&json).expect("o trace deve ser um JSON válido")
}

fn bytecode_texts(t: &Value) -> Vec<String> {
    t["bytecode"]
        .as_array()
        .unwrap()
        .iter()
        .map(|entry| entry["text"].as_str().unwrap().to_string())
        .collect()
}

fn step_instructions(t: &Value) -> Vec<String> {
    t["steps"]
        .as_array()
        .unwrap()
        .iter()
        .map(|step| step["instruction"].as_str().unwrap().to_string())
        .collect()
}

#[test]
fn maior_ou_igual_gera_menor_seguido_de_nega_logico() {
    let t = trace("var a = 5;\nvar b = 3;\nimprima(a >= b);");
    assert!(t["error"].is_null());
    let bc = bytecode_texts(&t);
    let idx = bc
        .iter()
        .position(|s| s == "menor")
        .expect("a >= b deveria emitir 'menor'");
    assert_eq!(
        bc[idx + 1],
        "nega lógico",
        "a VM não tem uma instrução de >=: ela compara com menor e nega o resultado"
    );
}

#[test]
fn atribuicao_como_comando_isolado_descarta_o_valor_no_topo() {
    let t = trace("var x = 0;\nx = 5;");
    assert!(t["error"].is_null());
    let bc = bytecode_texts(&t);
    let idx = bc
        .iter()
        .position(|s| s == "atribui global x")
        .expect("x = 5; deveria emitir 'atribui global x'");
    assert_eq!(
        bc[idx + 1],
        "descarta topo",
        "atribui global não desempilha; o comando isolado precisa descartar o valor sozinho"
    );
}

#[test]
fn curto_circuito_e_nao_avalia_o_lado_direito() {
    let t = trace("imprima(falso e (1 / 0));");
    assert!(
        t["error"].is_null(),
        "'e' com o lado esquerdo falso não deveria avaliar a divisão por zero à direita"
    );
}

#[test]
fn curto_circuito_ou_nao_avalia_o_lado_direito() {
    let t = trace("imprima(verdadeiro ou (1 / 0));");
    assert!(
        t["error"].is_null(),
        "'ou' com o lado esquerdo verdadeiro não deveria avaliar a divisão por zero à direita"
    );
}

#[test]
fn global_e_local_de_mesmo_nome_geram_instrucoes_diferentes() {
    let t = trace("var x = 1;\nfuncao f() {\n\tvar x = 2;\n\timprima(x);\n}\nf();\nimprima(x);");
    assert!(t["error"].is_null());
    let instrs = step_instructions(&t);
    assert!(
        instrs.iter().any(|i| i == "lê local"),
        "a leitura de x dentro da função deveria ser 'lê local'"
    );
    assert!(
        instrs.iter().any(|i| i == "lê global"),
        "a leitura de x fora da função deveria ser 'lê global'"
    );
}

#[test]
fn laco_de_duas_iteracoes_volta_exatamente_duas_vezes() {
    let t = trace("var i = 0;\nenquanto (i < 2) {\n\timprima(i);\n\ti = i + 1;\n}");
    assert!(t["error"].is_null());
    let instrs = step_instructions(&t);
    let voltas = instrs.iter().filter(|i| i.as_str() == "volta (laço)").count();
    assert_eq!(
        voltas, 2,
        "um laço de duas iterações deve mover o ip para trás exatamente duas vezes"
    );
}

#[test]
fn divisao_por_zero_gera_erro() {
    let t = trace("imprima(1 / 0);");
    let error = t["error"].as_str().expect("deveria haver um erro");
    assert!(error.contains("dividir por zero"));
}

#[test]
fn variavel_usada_no_proprio_inicializador_dentro_de_bloco_e_erro() {
    let t = trace("se (verdadeiro) {\n\tvar x = x;\n\timprima(x);\n}");
    let error = t["error"].as_str().expect("deveria haver um erro de resolução");
    assert!(error.contains("usada antes de ser inicializada"));
}

#[test]
fn variavel_redeclarada_no_mesmo_escopo_e_erro() {
    let t = trace("se (verdadeiro) {\n\tvar x = 1;\n\tvar x = 2;\n}");
    let error = t["error"].as_str().expect("deveria haver um erro de resolução");
    assert!(error.contains("já foi declarada"));
}

#[test]
fn toda_expressao_como_comando_devolve_a_pilha_como_encontrou() {
    let t = trace("1 + 1;\nvar x = 2;\nx = x + 1;\nimprima(x);");
    assert!(t["error"].is_null());
    let last_stack = t["steps"]
        .as_array()
        .unwrap()
        .last()
        .unwrap()["stack"]
        .as_array()
        .unwrap();
    assert!(
        last_stack.is_empty(),
        "depois do último comando a pilha deveria estar vazia, como no início do programa"
    );
}

#[test]
fn instrucoes_ocupam_um_ou_dois_bytes() {
    let t = trace("var a = 1;\nvar b = 2;\nimprima(a + b);");
    let bytecode = t["bytecode"].as_array().unwrap();
    for pair in bytecode.windows(2) {
        let a = pair[0]["offset"].as_u64().unwrap();
        let b = pair[1]["offset"].as_u64().unwrap();
        let delta = b - a;
        assert!(
            delta == 1 || delta == 2,
            "cada instrução deve ocupar 1 ou 2 bytes, mas o offset avançou {delta}"
        );
    }
}
