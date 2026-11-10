\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE seed_categoria (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_usuario (
    id INTEGER NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    nome VARCHAR(150) NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_endereco (
    id INTEGER NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_cliente (
    id INTEGER NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco_id INTEGER NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_funcionario (
    id INTEGER NOT NULL,
    data_nascimento DATE NOT NULL,
    ativo BOOLEAN NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE seed_solicitacao (
    id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    descricao_equipamento VARCHAR(150) NOT NULL,
    descricao_defeito TEXT NOT NULL,
    data_hora_abertura TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL,
    valor_orcamento NUMERIC(10,2),
    funcionario_orcamento_id INTEGER,
    data_hora_orcamento TIMESTAMP,
    funcionario_atual_id INTEGER,
    data_hora_pagamento TIMESTAMP,
    funcionario_finalizacao_id INTEGER,
    data_hora_finalizacao TIMESTAMP
) ON COMMIT DROP;

CREATE TEMP TABLE seed_historico (
    solicitacao_id INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    estado_anterior VARCHAR(20),
    estado_novo VARCHAR(20) NOT NULL,
    funcionario_id INTEGER,
    funcionario_destino_id INTEGER,
    valor NUMERIC(10,2),
    motivo TEXT,
    descricao_manutencao TEXT,
    orientacoes_cliente TEXT
) ON COMMIT DROP;

INSERT INTO seed_categoria (nome)
VALUES
    ('Notebook'),
    ('Desktop'),
    ('Impressora'),
    ('Mouse'),
    ('Teclado'),
    ('Monitor'),
    ('Hardware'),
    ('Celular');

INSERT INTO seed_usuario (id, email, senha_hash, salt, nome) VALUES
    (1, 'maria@teste.com', '104fe28863679c50959cdc37f2e6aa98ef33c08155852ac59a3e63d98f0b07d3', 'f3a91c07d2b84e65', 'Maria'),
    (2, 'mario@teste.com', '5831ac374aabad7a31e63fa84f15959870cab4eea4a40e53998576e079d38e09', '8d20b7e1c95a3f44', 'Mário'),
    (3, 'joao@teste.com', '81b652907fbef286018ae952ede3be15808390210ba6120385e8e84f894a403d', '4c7e19a0b3d6285f', 'João'),
    (4, 'jose@teste.com', 'c6784660b1ffc182d43d00d86f36ee8df2ccb209fefdee587f746155b71e2d5d', 'a1f58d3c72e09b46', 'José'),
    (5, 'joana@teste.com', 'ca06feb6b34d35ca8ffdf70afe2c426736d0df1cbd23315a31ddeafc1ae8ab4b', '6b94e2d07a1c53f8', 'Joana'),
    (6, 'joaquina@teste.com', '5221eef09fe6b445d04a8521c781b534c010e11883e1582d7950ef965fbdf11b', 'e07c3a5f19d84b62', 'Joaquina');
 
INSERT INTO seed_endereco (id, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES
    (1, '80010000', 'Rua XV de Novembro', '100', NULL, 'Centro', 'Curitiba', 'PR'),
    (2, '80420000', 'Avenida Sete de Setembro', '2500', 'Apto 31', 'Batel', 'Curitiba', 'PR'),
    (3, '82820000', 'Rua Guilherme Pugsley', '780', NULL, 'Água Verde', 'Curitiba', 'PR'),
    (4, '81530000', 'Rua Alcides Munhoz', '45', 'Casa 2', 'Jardim das Américas', 'Curitiba', 'PR');
 
INSERT INTO seed_cliente (id, cpf, telefone, endereco_id) VALUES
    (3, '39053344705', '41999990001', 1),
    (4, '11144477735', '41999990002', 2),
    (5, '52998224725', '41999990003', 3),
    (6, '16899535009', '41999990004', 4);
 
INSERT INTO seed_funcionario (id, data_nascimento, ativo) VALUES
    (1, '1990-05-10', TRUE),
    (2, '1992-08-20', TRUE);
 
INSERT INTO categoria_equipamento (nome)
SELECT nome
FROM seed_categoria
WHERE NOT EXISTS (
    SELECT 1
    FROM categoria_equipamento c
    WHERE c.nome = seed_categoria.nome
);

INSERT INTO usuario (email, senha_hash, salt, nome)
SELECT s.email, s.senha_hash, s.salt, s.nome
FROM seed_usuario s
WHERE NOT EXISTS (
    SELECT 1
    FROM usuario u
    WHERE LOWER(u.email) = LOWER(s.email)
);

INSERT INTO endereco (cep, logradouro, numero, complemento, bairro, cidade, estado)
SELECT s.cep, s.logradouro, s.numero, s.complemento, s.bairro, s.cidade, s.estado
FROM seed_endereco s
WHERE NOT EXISTS (
    SELECT 1
    FROM endereco e
    WHERE e.cep = s.cep
      AND e.logradouro = s.logradouro
      AND e.numero = s.numero
      AND e.bairro = s.bairro
      AND e.cidade = s.cidade
      AND e.estado = s.estado
);

INSERT INTO funcionario (id, data_nascimento, ativo)
SELECT u.id, sf.data_nascimento, sf.ativo
FROM seed_funcionario sf
JOIN seed_usuario su ON su.id = sf.id
JOIN usuario u ON LOWER(u.email) = LOWER(su.email)
WHERE NOT EXISTS (
    SELECT 1
    FROM funcionario f
    WHERE f.id = u.id
);

INSERT INTO cliente (id, cpf, telefone, endereco_id)
SELECT u.id, sc.cpf, sc.telefone, e.id
FROM seed_cliente sc
JOIN seed_usuario su ON su.id = sc.id
JOIN usuario u ON LOWER(u.email) = LOWER(su.email)
JOIN seed_endereco se ON se.id = sc.endereco_id
JOIN endereco e
  ON e.cep = se.cep
 AND e.logradouro = se.logradouro
 AND e.numero = se.numero
 AND e.bairro = se.bairro
 AND e.cidade = se.cidade
 AND e.estado = se.estado
WHERE NOT EXISTS (
    SELECT 1
    FROM cliente c
    WHERE c.id = u.id OR c.cpf = sc.cpf
);
 
INSERT INTO seed_solicitacao (id, cliente_id, categoria_id, descricao_equipamento, descricao_defeito, data_hora_abertura, estado, valor_orcamento, funcionario_orcamento_id, data_hora_orcamento, funcionario_atual_id, data_hora_pagamento, funcionario_finalizacao_id, data_hora_finalizacao) VALUES
    (1, 3, 1, 'Notebook Dell Inspiron 15', 'Tela quebrada após queda', '2026-08-03 09:15:00', 'FINALIZADA', 450.0, 1, '2026-08-04 10:00:00', 1, '2026-08-10 11:05:00', 1, '2026-08-11 09:00:00'),
    (2, 4, 2, 'Desktop Gamer', 'Placa-mãe com defeito', '2026-08-10 14:40:00', 'FINALIZADA', 780.0, 2, '2026-08-11 09:30:00', 2, '2026-09-01 15:20:00', 2, '2026-09-02 09:10:00'),
    (3, 5, 3, 'Impressora HP LaserJet', 'Não puxa o papel', '2026-08-17 11:00:00', 'FINALIZADA', 220.0, 1, '2026-08-18 09:00:00', 1, '2026-09-03 14:00:00', 1, '2026-09-04 10:00:00'),
    (4, 6, 4, 'Mouse Logitech sem fio', 'Botão esquerdo não clica', '2026-08-24 16:20:00', 'FINALIZADA', 60.0, 2, '2026-08-25 11:30:00', 2, '2026-09-03 16:30:00', 2, '2026-09-04 11:15:00'),
    (5, 3, 5, 'Teclado mecânico Redragon', 'Teclas travando', '2026-08-31 10:10:00', 'PAGA', 90.0, 1, '2026-09-01 09:20:00', 1, '2026-09-08 09:45:00', NULL, NULL),
    (6, 4, 6, 'Monitor Samsung 24 polegadas', 'Linhas verticais na tela', '2026-09-02 08:50:00', 'PAGA', 350.0, 2, '2026-09-03 14:10:00', 2, '2026-09-10 10:00:00', NULL, NULL),
    (7, 5, 1, 'Notebook Lenovo IdeaPad', 'Não liga', '2026-09-04 13:30:00', 'ARRUMADA', 520.0, 1, '2026-09-07 10:00:00', 1, NULL, NULL, NULL),
    (8, 6, 2, 'Desktop Positivo', 'Reinicia sozinho', '2026-09-07 09:00:00', 'ARRUMADA', 300.0, 2, '2026-09-08 09:40:00', 2, NULL, NULL, NULL),
    (9, 3, 8, 'Celular Samsung Galaxy A54', 'Bateria descarregando rápido', '2026-09-08 15:45:00', 'APROVADA', 180.0, 1, '2026-09-09 11:00:00', NULL, NULL, NULL, NULL),
    (10, 4, 7, 'SSD 480GB Kingston', 'Não é reconhecido pelo computador', '2026-09-10 10:20:00', 'APROVADA', 140.0, 2, '2026-09-11 10:00:00', NULL, NULL, NULL, NULL),
    (11, 5, 3, 'Impressora Epson EcoTank', 'Manchas nas impressões', '2026-09-11 14:00:00', 'REDIRECIONADA', 250.0, 2, '2026-09-14 09:00:00', 1, NULL, NULL, NULL),
    (12, 6, 1, 'Notebook Acer Aspire 5', 'Café derramado no teclado', '2026-09-14 09:30:00', 'REDIRECIONADA', 410.0, 1, '2026-09-15 10:20:00', 2, NULL, NULL, NULL),
    (13, 3, 6, 'Monitor LG 27 polegadas', 'Não liga', '2026-09-15 11:10:00', 'REJEITADA', 600.0, 2, '2026-09-16 10:30:00', NULL, NULL, NULL, NULL),
    (14, 4, 4, 'Mouse gamer Razer', 'Scroll com defeito', '2026-09-16 16:00:00', 'APROVADA', 120.0, 1, '2026-09-17 14:00:00', NULL, NULL, NULL, NULL),
    (15, 5, 5, 'Teclado Logitech K380', 'Não conecta via bluetooth', '2026-09-18 10:00:00', 'ORÇADA', 75.0, 2, '2026-09-21 11:00:00', NULL, NULL, NULL, NULL),
    (16, 6, 2, 'Desktop Lenovo ThinkCentre', 'Não dá vídeo', '2026-09-19 09:40:00', 'REJEITADA', 450.0, 1, '2026-09-21 10:00:00', NULL, NULL, NULL, NULL),
    (17, 3, 8, 'Celular Motorola Moto G', 'Tela trincada', '2026-09-21 13:20:00', 'ORÇADA', 280.0, 1, '2026-09-22 09:50:00', NULL, NULL, NULL, NULL),
    (18, 4, 2, 'Desktop Dell OptiPlex', 'Fonte queimada', '2026-09-23 09:05:00', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (19, 5, 3, 'Impressora Brother HL-1202', 'Atolando papel', '2026-09-25 14:30:00', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (20, 6, 7, 'Placa de vídeo GTX 1650', 'Artefatos na imagem', '2026-09-29 10:45:00', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (21, 3, 1, 'Notebook Samsung Book', 'Superaquecimento', '2026-10-02 15:15:00', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (22, 4, 6, 'Monitor Dell 22 polegadas', 'Imagem tremendo', TIMESTAMP '2026-11-09 08:30:00', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (23, 5, 8, 'Celular iPhone 11', 'Não carrega', TIMESTAMP '2026-11-09 09:10:00', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO solicitacao (cliente_id, categoria_id, descricao_equipamento, descricao_defeito, data_hora_abertura, estado, valor_orcamento, funcionario_orcamento_id, data_hora_orcamento, funcionario_atual_id, data_hora_pagamento, funcionario_finalizacao_id, data_hora_finalizacao)
SELECT c.id, cat.id, ss.descricao_equipamento, ss.descricao_defeito, ss.data_hora_abertura, ss.estado,
       ss.valor_orcamento, fo.id, ss.data_hora_orcamento, fa.id, ss.data_hora_pagamento, ff.id, ss.data_hora_finalizacao
FROM seed_solicitacao ss
JOIN seed_cliente sc ON sc.id = ss.cliente_id
JOIN cliente c ON c.cpf = sc.cpf
JOIN seed_categoria sct ON sct.id = ss.categoria_id
JOIN categoria_equipamento cat ON cat.nome = sct.nome
LEFT JOIN seed_funcionario sfo ON sfo.id = ss.funcionario_orcamento_id
LEFT JOIN seed_usuario suo ON suo.id = sfo.id
LEFT JOIN usuario uo ON LOWER(uo.email) = LOWER(suo.email)
LEFT JOIN funcionario fo ON fo.id = uo.id
LEFT JOIN seed_funcionario sfa ON sfa.id = ss.funcionario_atual_id
LEFT JOIN seed_usuario sua ON sua.id = sfa.id
LEFT JOIN usuario ua ON LOWER(ua.email) = LOWER(sua.email)
LEFT JOIN funcionario fa ON fa.id = ua.id
LEFT JOIN seed_funcionario sff ON sff.id = ss.funcionario_finalizacao_id
LEFT JOIN seed_usuario suf ON suf.id = sff.id
LEFT JOIN usuario uf ON LOWER(uf.email) = LOWER(suf.email)
LEFT JOIN funcionario ff ON ff.id = uf.id
WHERE NOT EXISTS (
    SELECT 1
    FROM solicitacao existing
    WHERE existing.cliente_id = c.id
      AND existing.categoria_id = cat.id
      AND existing.descricao_equipamento = ss.descricao_equipamento
      AND existing.descricao_defeito = ss.descricao_defeito
      AND existing.data_hora_abertura = ss.data_hora_abertura
);

INSERT INTO seed_historico (solicitacao_id, data_hora, estado_anterior, estado_novo, funcionario_id, funcionario_destino_id, valor, motivo, descricao_manutencao, orientacoes_cliente) VALUES
    (1, '2026-08-03 09:15:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (1, '2026-08-04 10:00:00', 'ABERTA', 'ORÇADA', 1, NULL, 450.0, NULL, NULL, NULL),
    (1, '2026-08-05 14:20:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (1, '2026-08-07 16:30:00', 'APROVADA', 'ARRUMADA', 1, NULL, NULL, NULL, 'Troca da tela do notebook', 'Evitar transportar o notebook sem a capa de proteção'),
    (1, '2026-08-10 11:05:00', 'ARRUMADA', 'PAGA', NULL, NULL, NULL, NULL, NULL, NULL),
    (1, '2026-08-11 09:00:00', 'PAGA', 'FINALIZADA', 1, NULL, NULL, NULL, NULL, NULL),
    (2, '2026-08-10 14:40:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (2, '2026-08-11 09:30:00', 'ABERTA', 'ORÇADA', 2, NULL, 780.0, NULL, NULL, NULL),
    (2, '2026-08-12 10:15:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (2, '2026-08-14 17:00:00', 'APROVADA', 'ARRUMADA', 2, NULL, NULL, NULL, 'Substituição da placa-mãe e limpeza interna', 'Manter o computador ligado a um estabilizador ou nobreak'),
    (2, '2026-09-01 15:20:00', 'ARRUMADA', 'PAGA', NULL, NULL, NULL, NULL, NULL, NULL),
    (2, '2026-09-02 09:10:00', 'PAGA', 'FINALIZADA', 2, NULL, NULL, NULL, NULL, NULL),
    (3, '2026-08-17 11:00:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (3, '2026-08-18 09:00:00', 'ABERTA', 'ORÇADA', 1, NULL, 220.0, NULL, NULL, NULL),
    (3, '2026-08-18 16:45:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (3, '2026-08-20 15:10:00', 'APROVADA', 'ARRUMADA', 1, NULL, NULL, NULL, 'Limpeza e troca dos roletes de tração do papel', 'Usar papel de boa qualidade e evitar folhas úmidas'),
    (3, '2026-09-03 14:00:00', 'ARRUMADA', 'PAGA', NULL, NULL, NULL, NULL, NULL, NULL),
    (3, '2026-09-04 10:00:00', 'PAGA', 'FINALIZADA', 1, NULL, NULL, NULL, NULL, NULL),
    (4, '2026-08-24 16:20:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (4, '2026-08-25 11:30:00', 'ABERTA', 'ORÇADA', 2, NULL, 60.0, NULL, NULL, NULL),
    (4, '2026-08-25 18:00:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (4, '2026-08-26 14:00:00', 'APROVADA', 'ARRUMADA', 2, NULL, NULL, NULL, 'Troca do microswitch do botão esquerdo', 'Evitar cliques muito fortes e manter o mouse limpo'),
    (4, '2026-09-03 16:30:00', 'ARRUMADA', 'PAGA', NULL, NULL, NULL, NULL, NULL, NULL),
    (4, '2026-09-04 11:15:00', 'PAGA', 'FINALIZADA', 2, NULL, NULL, NULL, NULL, NULL),
    (5, '2026-08-31 10:10:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (5, '2026-09-01 09:20:00', 'ABERTA', 'ORÇADA', 1, NULL, 90.0, NULL, NULL, NULL),
    (5, '2026-09-01 13:00:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (5, '2026-09-03 10:40:00', 'APROVADA', 'ARRUMADA', 1, NULL, NULL, NULL, 'Limpeza das teclas e troca dos switches danificados', 'Evitar comer ou beber próximo ao teclado'),
    (5, '2026-09-08 09:45:00', 'ARRUMADA', 'PAGA', NULL, NULL, NULL, NULL, NULL, NULL),
    (6, '2026-09-02 08:50:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (6, '2026-09-03 14:10:00', 'ABERTA', 'ORÇADA', 2, NULL, 350.0, NULL, NULL, NULL),
    (6, '2026-09-04 09:30:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (6, '2026-09-09 15:20:00', 'APROVADA', 'ARRUMADA', 2, NULL, NULL, NULL, 'Substituição do cabo flat do painel', 'Não pressionar a tela ao limpar o monitor'),
    (6, '2026-09-10 10:00:00', 'ARRUMADA', 'PAGA', NULL, NULL, NULL, NULL, NULL, NULL),
    (7, '2026-09-04 13:30:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (7, '2026-09-07 10:00:00', 'ABERTA', 'ORÇADA', 1, NULL, 520.0, NULL, NULL, NULL),
    (7, '2026-09-08 11:20:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (7, '2026-09-14 16:00:00', 'APROVADA', 'ARRUMADA', 1, NULL, NULL, NULL, 'Troca da fonte de alimentação e limpeza geral', 'Utilizar apenas o carregador original'),
    (8, '2026-09-07 09:00:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (8, '2026-09-08 09:40:00', 'ABERTA', 'ORÇADA', 2, NULL, 300.0, NULL, NULL, NULL),
    (8, '2026-09-09 08:55:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (8, '2026-09-10 10:30:00', 'APROVADA', 'REDIRECIONADA', 1, 2, NULL, NULL, NULL, NULL),
    (8, '2026-09-11 15:00:00', 'REDIRECIONADA', 'ARRUMADA', 2, NULL, NULL, NULL, 'Troca da pasta térmica e substituição da memória RAM', 'Manter as saídas de ventilação desobstruídas'),
    (9, '2026-09-08 15:45:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (9, '2026-09-09 11:00:00', 'ABERTA', 'ORÇADA', 1, NULL, 180.0, NULL, NULL, NULL),
    (9, '2026-09-10 09:15:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (10, '2026-09-10 10:20:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (10, '2026-09-11 10:00:00', 'ABERTA', 'ORÇADA', 2, NULL, 140.0, NULL, NULL, NULL),
    (10, '2026-09-11 17:30:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (11, '2026-09-11 14:00:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (11, '2026-09-14 09:00:00', 'ABERTA', 'ORÇADA', 2, NULL, 250.0, NULL, NULL, NULL),
    (11, '2026-09-15 10:10:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (11, '2026-09-16 11:20:00', 'APROVADA', 'REDIRECIONADA', 2, 1, NULL, NULL, NULL, NULL),
    (12, '2026-09-14 09:30:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (12, '2026-09-15 10:20:00', 'ABERTA', 'ORÇADA', 1, NULL, 410.0, NULL, NULL, NULL),
    (12, '2026-09-16 08:40:00', 'ORÇADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (12, '2026-09-17 10:00:00', 'APROVADA', 'REDIRECIONADA', 1, 2, NULL, NULL, NULL, NULL),
    (12, '2026-09-17 15:30:00', 'REDIRECIONADA', 'REDIRECIONADA', 2, 1, NULL, NULL, NULL, NULL),
    (12, '2026-09-21 09:20:00', 'REDIRECIONADA', 'REDIRECIONADA', 1, 2, NULL, NULL, NULL, NULL),
    (13, '2026-09-15 11:10:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (13, '2026-09-16 10:30:00', 'ABERTA', 'ORÇADA', 2, NULL, 600.0, NULL, NULL, NULL),
    (13, '2026-09-17 09:00:00', 'ORÇADA', 'REJEITADA', NULL, NULL, NULL, 'Valor do conserto próximo ao de um monitor novo', NULL, NULL),
    (14, '2026-09-16 16:00:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (14, '2026-09-17 14:00:00', 'ABERTA', 'ORÇADA', 1, NULL, 120.0, NULL, NULL, NULL),
    (14, '2026-09-18 10:00:00', 'ORÇADA', 'REJEITADA', NULL, NULL, NULL, 'Prazo de reparo muito longo', NULL, NULL),
    (14, '2026-09-19 09:30:00', 'REJEITADA', 'APROVADA', NULL, NULL, NULL, NULL, NULL, NULL),
    (15, '2026-09-18 10:00:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (15, '2026-09-21 11:00:00', 'ABERTA', 'ORÇADA', 2, NULL, 75.0, NULL, NULL, NULL),
    (16, '2026-09-19 09:40:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (16, '2026-09-21 10:00:00', 'ABERTA', 'ORÇADA', 1, NULL, 450.0, NULL, NULL, NULL),
    (16, '2026-09-22 08:30:00', 'ORÇADA', 'REJEITADA', NULL, NULL, NULL, 'Optei por comprar um equipamento novo', NULL, NULL),
    (17, '2026-09-21 13:20:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (17, '2026-09-22 09:50:00', 'ABERTA', 'ORÇADA', 1, NULL, 280.0, NULL, NULL, NULL),
    (18, '2026-09-23 09:05:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (19, '2026-09-25 14:30:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (20, '2026-09-29 10:45:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (21, '2026-10-02 15:15:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (22, TIMESTAMP '2026-11-09 08:30:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL),
    (23, TIMESTAMP '2026-11-09 09:10:00', NULL, 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO historico_solicitacao (
    solicitacao_id,
    data_hora,
    estado_anterior,
    estado_novo,
    funcionario_id,
    funcionario_destino_id,
    valor,
    motivo,
    descricao_manutencao,
    orientacoes_cliente
)
SELECT s.id, sh.data_hora, sh.estado_anterior, sh.estado_novo, f.id, fd.id,
       sh.valor, sh.motivo, sh.descricao_manutencao, sh.orientacoes_cliente
FROM seed_historico sh
JOIN seed_solicitacao ss ON ss.id = sh.solicitacao_id
JOIN seed_cliente sc ON sc.id = ss.cliente_id
JOIN cliente c ON c.cpf = sc.cpf
JOIN seed_categoria sct ON sct.id = ss.categoria_id
JOIN categoria_equipamento cat ON cat.nome = sct.nome
JOIN solicitacao s
  ON s.cliente_id = c.id
 AND s.categoria_id = cat.id
 AND s.descricao_equipamento = ss.descricao_equipamento
 AND s.descricao_defeito = ss.descricao_defeito
 AND s.data_hora_abertura = ss.data_hora_abertura
LEFT JOIN seed_funcionario sfd ON sfd.id = sh.funcionario_id
LEFT JOIN seed_usuario sud ON sud.id = sfd.id
LEFT JOIN usuario ufd ON LOWER(ufd.email) = LOWER(sud.email)
LEFT JOIN funcionario f ON f.id = ufd.id
LEFT JOIN seed_funcionario sfdd ON sfdd.id = sh.funcionario_destino_id
LEFT JOIN seed_usuario sudd ON sudd.id = sfdd.id
LEFT JOIN usuario ufdd ON LOWER(ufdd.email) = LOWER(sudd.email)
LEFT JOIN funcionario fd ON fd.id = ufdd.id
WHERE NOT EXISTS (
    SELECT 1
    FROM historico_solicitacao existing
    WHERE existing.solicitacao_id = s.id
      AND existing.data_hora = sh.data_hora
      AND existing.estado_anterior IS NOT DISTINCT FROM sh.estado_anterior
      AND existing.estado_novo = sh.estado_novo
      AND existing.funcionario_id IS NOT DISTINCT FROM f.id
      AND existing.funcionario_destino_id IS NOT DISTINCT FROM fd.id
      AND existing.valor IS NOT DISTINCT FROM sh.valor
      AND existing.motivo IS NOT DISTINCT FROM sh.motivo
      AND existing.descricao_manutencao IS NOT DISTINCT FROM sh.descricao_manutencao
      AND existing.orientacoes_cliente IS NOT DISTINCT FROM sh.orientacoes_cliente
);

SELECT setval(
    pg_get_serial_sequence('usuario', 'id'),
    COALESCE((SELECT MAX(id) FROM usuario), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('endereco', 'id'),
    COALESCE((SELECT MAX(id) FROM endereco), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('categoria_equipamento', 'id'),
    COALESCE((SELECT MAX(id) FROM categoria_equipamento), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('solicitacao', 'id'),
    COALESCE((SELECT MAX(id) FROM solicitacao), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('historico_solicitacao', 'id'),
    COALESCE((SELECT MAX(id) FROM historico_solicitacao), 1),
    true
);

COMMIT;
