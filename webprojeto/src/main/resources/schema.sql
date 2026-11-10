CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    nome VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS endereco (
    id SERIAL PRIMARY KEY,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cliente (
    id INTEGER PRIMARY KEY REFERENCES usuario(id),
    cpf VARCHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    endereco_id INTEGER NOT NULL REFERENCES endereco(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE cliente ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS funcionario (
    id INTEGER PRIMARY KEY REFERENCES usuario(id),
    data_nascimento DATE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS categoria_equipamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS solicitacao (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    categoria_id INTEGER NOT NULL REFERENCES categoria_equipamento(id),
    descricao_equipamento VARCHAR(150) NOT NULL,
    descricao_defeito TEXT NOT NULL,
    data_hora_abertura TIMESTAMP NOT NULL DEFAULT NOW(),
    estado VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    valor_orcamento NUMERIC(10,2),
    funcionario_orcamento_id INTEGER REFERENCES funcionario(id),
    data_hora_orcamento TIMESTAMP,
    funcionario_atual_id INTEGER REFERENCES funcionario(id),
    data_hora_pagamento TIMESTAMP,
    funcionario_finalizacao_id INTEGER REFERENCES funcionario(id),
    data_hora_finalizacao TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historico_solicitacao (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER NOT NULL REFERENCES solicitacao(id),
    data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    estado_anterior VARCHAR(20),
    estado_novo VARCHAR(20) NOT NULL,
    funcionario_id INTEGER REFERENCES funcionario(id),
    funcionario_destino_id INTEGER REFERENCES funcionario(id),
    valor NUMERIC(10,2),
    motivo TEXT,
    descricao_manutencao TEXT,
    orientacoes_cliente TEXT
);

-- Integridade (T37): só estados conhecidos e orçamento positivo, também para quem altera o banco
-- fora da API. DROP + ADD em vez de DO $$: o Spring executa este arquivo separando por ";".
ALTER TABLE solicitacao DROP CONSTRAINT IF EXISTS solicitacao_estado_valido;
ALTER TABLE solicitacao ADD CONSTRAINT solicitacao_estado_valido CHECK (estado IN
    ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA'));

ALTER TABLE solicitacao DROP CONSTRAINT IF EXISTS solicitacao_valor_positivo;
ALTER TABLE solicitacao ADD CONSTRAINT solicitacao_valor_positivo
    CHECK (valor_orcamento IS NULL OR valor_orcamento > 0);

ALTER TABLE historico_solicitacao DROP CONSTRAINT IF EXISTS historico_estados_validos;
ALTER TABLE historico_solicitacao ADD CONSTRAINT historico_estados_validos CHECK (
    estado_novo IN ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA')
    AND (estado_anterior IS NULL OR estado_anterior IN
        ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA')));

CREATE INDEX IF NOT EXISTS idx_historico_solicitacao ON historico_solicitacao (solicitacao_id, data_hora);
