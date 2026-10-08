INSERT INTO categoria_equipamento (nome)
VALUES
    ('Notebook'),
    ('Desktop'),
    ('Impressora'),
    ('Mouse'),
    ('Teclado'),
    ('Monitor'),
    ('Hardware'),
    ('Celular');

INSERT INTO usuario (id, email, senha_hash, salt, nome) VALUES
    (1, 'maria@teste.com', '104fe28863679c50959cdc37f2e6aa98ef33c08155852ac59a3e63d98f0b07d3', 'f3a91c07d2b84e65', 'Maria'),
    (2, 'mario@teste.com', '5831ac374aabad7a31e63fa84f15959870cab4eea4a40e53998576e079d38e09', '8d20b7e1c95a3f44', 'Mário'),
    (3, 'joao@teste.com', '81b652907fbef286018ae952ede3be15808390210ba6120385e8e84f894a403d', '4c7e19a0b3d6285f', 'João'),
    (4, 'jose@teste.com', 'c6784660b1ffc182d43d00d86f36ee8df2ccb209fefdee587f746155b71e2d5d', 'a1f58d3c72e09b46', 'José'),
    (5, 'joana@teste.com', 'ca06feb6b34d35ca8ffdf70afe2c426736d0df1cbd23315a31ddeafc1ae8ab4b', '6b94e2d07a1c53f8', 'Joana'),
    (6, 'joaquina@teste.com', '5221eef09fe6b445d04a8521c781b534c010e11883e1582d7950ef965fbdf11b', 'e07c3a5f19d84b62', 'Joaquina');
 
INSERT INTO endereco (id, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES
    (1, '80010000', 'Rua XV de Novembro', '100', NULL, 'Centro', 'Curitiba', 'PR'),
    (2, '80420000', 'Avenida Sete de Setembro', '2500', 'Apto 31', 'Batel', 'Curitiba', 'PR'),
    (3, '82820000', 'Rua Guilherme Pugsley', '780', NULL, 'Água Verde', 'Curitiba', 'PR'),
    (4, '81530000', 'Rua Alcides Munhoz', '45', 'Casa 2', 'Jardim das Américas', 'Curitiba', 'PR');
 
INSERT INTO cliente (id, cpf, telefone, endereco_id) VALUES
    (3, '39053344705', '41999990001', 1),
    (4, '11144477735', '41999990002', 2),
    (5, '52998224725', '41999990003', 3),
    (6, '16899535009', '41999990004', 4);
 
INSERT INTO funcionario (id, data_nascimento, ativo) VALUES
    (1, '1990-05-10', TRUE),
    (2, '1992-08-20', TRUE);
 
SELECT setval(pg_get_serial_sequence('usuario', 'id'), (SELECT MAX(id) FROM usuario));
SELECT setval(pg_get_serial_sequence('endereco', 'id'), (SELECT MAX(id) FROM endereco));
 
INSERT INTO solicitacao (id, cliente_id, categoria_id, descricao_equipamento, descricao_defeito, data_hora_abertura, estado, valor_orcamento, funcionario_orcamento_id, data_hora_orcamento, funcionario_atual_id, data_hora_pagamento, funcionario_finalizacao_id, data_hora_finalizacao) VALUES
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
    (22, 4, 6, 'Monitor Dell 22 polegadas', 'Imagem tremendo', CURRENT_DATE + TIME '08:30', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (23, 5, 8, 'Celular iPhone 11', 'Não carrega', CURRENT_DATE + TIME '09:10', 'ABERTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

    SELECT setval(pg_get_serial_sequence('solicitacao', 'id'), (SELECT MAX(id) FROM solicitacao));
