-- Contas de demonstração; a senha de todas é 1234. Salt compartilhado somente para teste.
INSERT INTO usuario (nome, email, senha_hash, salt)
VALUES
    ('Maria', 'maria.funcionario@example.com', '684bf3c863d2278f46c1f6e2b1153e2824c7de9281292d554bc6ed19e1a9c296', 'demo-salt-v1:'),
    ('Mário', 'mario.funcionario@example.com', '684bf3c863d2278f46c1f6e2b1153e2824c7de9281292d554bc6ed19e1a9c296', 'demo-salt-v1:'),
    ('João', 'joao.cliente@example.com', '684bf3c863d2278f46c1f6e2b1153e2824c7de9281292d554bc6ed19e1a9c296', 'demo-salt-v1:'),
    ('José', 'jose.cliente@example.com', '684bf3c863d2278f46c1f6e2b1153e2824c7de9281292d554bc6ed19e1a9c296', 'demo-salt-v1:'),
    ('Joana', 'joana.cliente@example.com', '684bf3c863d2278f46c1f6e2b1153e2824c7de9281292d554bc6ed19e1a9c296', 'demo-salt-v1:'),
    ('Joaquina', 'joaquina.cliente@example.com', '684bf3c863d2278f46c1f6e2b1153e2824c7de9281292d554bc6ed19e1a9c296', 'demo-salt-v1:')
ON CONFLICT (email) DO UPDATE
SET senha_hash = EXCLUDED.senha_hash,
    salt = EXCLUDED.salt;

INSERT INTO endereco (cep, logradouro, numero, bairro, cidade, estado)
SELECT '80000-000', 'Rua Exemplo', '100', 'Centro', 'Curitiba', 'PR'
WHERE NOT EXISTS (
    SELECT 1
    FROM endereco
    WHERE cep = '80000-000'
      AND logradouro = 'Rua Exemplo'
      AND numero = '100'
      AND bairro = 'Centro'
      AND cidade = 'Curitiba'
      AND estado = 'PR'
);

INSERT INTO funcionario (id, data_nascimento, ativo)
SELECT u.id, v.data_nascimento, TRUE
FROM (
    VALUES
        ('maria.funcionario@example.com', DATE '1990-01-01'),
        ('mario.funcionario@example.com', DATE '1990-02-02')
) AS v(email, data_nascimento)
JOIN usuario u ON u.email = v.email
ON CONFLICT (id) DO NOTHING;

INSERT INTO cliente (id, cpf, telefone, endereco_id)
SELECT u.id, v.cpf, v.telefone, e.id
FROM (
    VALUES
        ('joao.cliente@example.com', '12345678909', '41999990001'),
        ('jose.cliente@example.com', '98765432102', '41999990002'),
        ('joana.cliente@example.com', '32165498791', '41999990003'),
        ('joaquina.cliente@example.com', '11122233310', '41999990004')
) AS v(email, cpf, telefone)
JOIN usuario u ON u.email = v.email
CROSS JOIN LATERAL (
    SELECT id
    FROM endereco
    WHERE cep = '80000-000'
      AND logradouro = 'Rua Exemplo'
      AND numero = '100'
      AND bairro = 'Centro'
      AND cidade = 'Curitiba'
      AND estado = 'PR'
    ORDER BY id
    LIMIT 1
) e
WHERE NOT EXISTS (
    SELECT 1
    FROM cliente c
    WHERE c.id = u.id OR c.cpf = v.cpf
);

INSERT INTO categoria_equipamento (nome)
SELECT v.nome
FROM (
    VALUES ('Notebook'), ('Desktop'), ('Impressora'), ('Mouse'), ('Teclado')
) AS v(nome)
WHERE NOT EXISTS (
    SELECT 1
    FROM categoria_equipamento c
    WHERE c.nome = v.nome
);

-- Solicitações de demonstração;
WITH dados (
    cliente_email, categoria, equipamento, defeito, abertura, estado, valor,
    funcionario_orcamento_email, data_orcamento, funcionario_atual_email,
    data_pagamento, funcionario_finalizacao_email, data_finalizacao
) AS (
    VALUES
        ('joao.cliente@example.com', 'Notebook', 'Notebook Dell Inspiron 15 (demo 01)', 'Não liga e o LED de energia permanece apagado.', TIMESTAMP '2026-01-05 08:15:00', 'ABERTA', NULL::NUMERIC, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('jose.cliente@example.com', 'Desktop', 'Desktop Ryzen 5 (demo 02)', 'Desliga sozinho após alguns minutos de uso.', TIMESTAMP '2026-03-12 10:30:00', 'ABERTA', NULL::NUMERIC, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joana.cliente@example.com', 'Impressora', 'Impressora Epson EcoTank L3250 (demo 03)', 'Imprime páginas em branco mesmo com os tanques cheios.', TIMESTAMP '2026-08-21 14:05:00', 'ABERTA', NULL::NUMERIC, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joaquina.cliente@example.com', 'Mouse', 'Mouse Logitech M280 (demo 04)', 'O cursor apresenta falhas e não responde aos movimentos.', TIMESTAMP '2026-11-10 09:20:00', 'ABERTA', NULL::NUMERIC, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),

        ('joao.cliente@example.com', 'Notebook', 'Notebook Lenovo ThinkPad T480 (demo 05)', 'A bateria não carrega e o equipamento só funciona ligado à tomada.', TIMESTAMP '2026-01-18 11:10:00', 'ORÇADA', 280.00, 'maria.funcionario@example.com', TIMESTAMP '2026-01-19 09:00:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('jose.cliente@example.com', 'Desktop', 'Desktop Dell OptiPlex 7070 (demo 06)', 'O computador não reconhece os dispositivos conectados às portas USB.', TIMESTAMP '2026-04-03 13:45:00', 'ORÇADA', 420.00, 'mario.funcionario@example.com', TIMESTAMP '2026-04-04 10:15:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joana.cliente@example.com', 'Impressora', 'Impressora HP LaserJet Pro M15 (demo 07)', 'O papel fica preso no alimentador durante a impressão.', TIMESTAMP '2026-09-02 16:25:00', 'ORÇADA', 195.50, 'maria.funcionario@example.com', TIMESTAMP '2026-09-03 08:40:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),

        ('joao.cliente@example.com', 'Notebook', 'Notebook Acer Aspire 5 (demo 08)', 'A tela pisca e apresenta linhas coloridas ao movimentar a tampa.', TIMESTAMP '2026-02-11 08:50:00', 'APROVADA', 560.00, 'mario.funcionario@example.com', TIMESTAMP '2026-02-12 09:10:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('jose.cliente@example.com', 'Desktop', 'Desktop HP ProDesk 400 (demo 09)', 'O sistema operacional não inicia e exibe uma mensagem de disco.', TIMESTAMP '2026-05-22 15:35:00', 'APROVADA', 310.00, 'maria.funcionario@example.com', TIMESTAMP '2026-05-23 10:20:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joana.cliente@example.com', 'Teclado', 'Teclado mecânico Redragon Kumara (demo 10)', 'Algumas teclas deixam de funcionar após alguns minutos.', TIMESTAMP '2026-10-04 12:00:00', 'APROVADA', 145.00, 'mario.funcionario@example.com', TIMESTAMP '2026-10-05 08:30:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),

        ('joaquina.cliente@example.com', 'Notebook', 'Notebook Samsung Book E30 (demo 11)', 'A dobradiça está solta e a tampa não permanece aberta.', TIMESTAMP '2026-02-28 09:25:00', 'REJEITADA', 390.00, 'maria.funcionario@example.com', TIMESTAMP '2026-03-01 11:00:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joao.cliente@example.com', 'Impressora', 'Impressora Brother HL-L2350DW (demo 12)', 'A impressão sai muito clara mesmo com toner recém-substituído.', TIMESTAMP '2026-06-15 10:40:00', 'REJEITADA', 220.00, 'mario.funcionario@example.com', TIMESTAMP '2026-06-16 08:15:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('jose.cliente@example.com', 'Teclado', 'Teclado Logitech K380 (demo 13)', 'O teclado Bluetooth desconecta repetidamente durante a digitação.', TIMESTAMP '2026-07-07 14:30:00', 'APROVADA', 125.00, 'maria.funcionario@example.com', TIMESTAMP '2026-07-08 09:05:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),

        ('joana.cliente@example.com', 'Desktop', 'Desktop Lenovo ThinkCentre M720 (demo 14)', 'O ventilador faz ruído alto e o gabinete aquece excessivamente.', TIMESTAMP '2026-03-19 08:05:00', 'REDIRECIONADA', 680.00, 'maria.funcionario@example.com', TIMESTAMP '2026-03-20 10:00:00', 'mario.funcionario@example.com', NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joaquina.cliente@example.com', 'Impressora', 'Impressora Canon Pixma G3110 (demo 15)', 'A impressora não puxa papel e apresenta erro de alimentação.', TIMESTAMP '2026-08-11 13:15:00', 'REDIRECIONADA', 215.00, 'mario.funcionario@example.com', TIMESTAMP '2026-08-12 09:30:00', 'mario.funcionario@example.com', NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joao.cliente@example.com', 'Desktop', 'Desktop Asus ExpertCenter D5 (demo 16)', 'O equipamento reinicia durante tarefas que exigem mais processamento.', TIMESTAMP '2026-10-18 11:55:00', 'REDIRECIONADA', 845.00, 'mario.funcionario@example.com', TIMESTAMP '2026-10-19 10:45:00', 'maria.funcionario@example.com', NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),

        ('jose.cliente@example.com', 'Notebook', 'Notebook Positivo Motion C4500 (demo 17)', 'A ventoinha não gira e o notebook apresenta alerta de temperatura.', TIMESTAMP '2026-04-16 09:40:00', 'ARRUMADA', 295.00, 'maria.funcionario@example.com', TIMESTAMP '2026-04-17 08:50:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joana.cliente@example.com', 'Teclado', 'Teclado Microsoft Wired 600 (demo 18)', 'O cabo apresenta mau contato e interrompe a digitação.', TIMESTAMP '2026-06-27 15:20:00', 'ARRUMADA', 135.00, 'mario.funcionario@example.com', TIMESTAMP '2026-06-28 09:15:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),
        ('joaquina.cliente@example.com', 'Desktop', 'Desktop Acer Veriton X (demo 19)', 'O computador não apresenta imagem apesar de ligar normalmente.', TIMESTAMP '2026-09-14 10:10:00', 'ARRUMADA', 470.00, 'mario.funcionario@example.com', TIMESTAMP '2026-09-15 11:25:00', NULL::VARCHAR, NULL::TIMESTAMP, NULL::VARCHAR, NULL::TIMESTAMP),

        ('joao.cliente@example.com', 'Notebook', 'Notebook Asus VivoBook 15 (demo 20)', 'A bateria descarrega rapidamente e o carregador aquece.', TIMESTAMP '2026-05-06 08:35:00', 'PAGA', 355.00, 'maria.funcionario@example.com', TIMESTAMP '2026-05-07 09:20:00', NULL::VARCHAR, TIMESTAMP '2026-05-11 14:00:00', NULL::VARCHAR, NULL::TIMESTAMP),
        ('jose.cliente@example.com', 'Impressora', 'Impressora Samsung Xpress M2020 (demo 21)', 'A impressora não é reconhecida pelo computador via USB.', TIMESTAMP '2026-10-01 14:45:00', 'PAGA', 235.00, 'mario.funcionario@example.com', TIMESTAMP '2026-10-02 10:10:00', NULL::VARCHAR, TIMESTAMP '2026-10-08 16:30:00', NULL::VARCHAR, NULL::TIMESTAMP),

        ('joana.cliente@example.com', 'Notebook', 'Notebook Dell Latitude 5490 (demo 22)', 'O conector de energia está frouxo e interrompe o carregamento.', TIMESTAMP '2026-01-27 10:00:00', 'FINALIZADA', 640.00, 'maria.funcionario@example.com', TIMESTAMP '2026-01-28 09:00:00', NULL::VARCHAR, TIMESTAMP '2026-02-02 11:35:00', 'maria.funcionario@example.com', TIMESTAMP '2026-02-03 08:30:00'),
        ('joaquina.cliente@example.com', 'Desktop', 'Desktop Lenovo ThinkCentre M710 (demo 23)', 'O disco apresenta erros e o carregamento do sistema está muito lento.', TIMESTAMP '2026-05-30 13:25:00', 'FINALIZADA', 525.00, 'mario.funcionario@example.com', TIMESTAMP '2026-05-31 10:30:00', NULL::VARCHAR, TIMESTAMP '2026-06-05 15:15:00', 'mario.funcionario@example.com', TIMESTAMP '2026-06-06 09:40:00'),
        ('joao.cliente@example.com', 'Impressora', 'Impressora Epson L3150 (demo 24)', 'A tinta borra as folhas e a impressão apresenta faixas horizontais.', TIMESTAMP '2026-07-20 09:15:00', 'FINALIZADA', 185.00, 'maria.funcionario@example.com', TIMESTAMP '2026-07-21 08:45:00', NULL::VARCHAR, TIMESTAMP '2026-07-25 12:10:00', 'maria.funcionario@example.com', TIMESTAMP '2026-07-26 10:20:00')
)
INSERT INTO solicitacao (
    cliente_id, categoria_id, descricao_equipamento, descricao_defeito,
    data_hora_abertura, estado, valor_orcamento, funcionario_orcamento_id,
    data_hora_orcamento, funcionario_atual_id, data_hora_pagamento,
    funcionario_finalizacao_id, data_hora_finalizacao
)
SELECT cl.id, cat.id, d.equipamento, d.defeito, d.abertura, d.estado,
       d.valor, fo.id, d.data_orcamento, fa.id, d.data_pagamento, ff.id, d.data_finalizacao
FROM dados d
JOIN usuario uc ON LOWER(uc.email) = LOWER(d.cliente_email)
JOIN cliente cl ON cl.id = uc.id
JOIN categoria_equipamento cat ON LOWER(cat.nome) = LOWER(d.categoria)
LEFT JOIN usuario uo ON LOWER(uo.email) = LOWER(d.funcionario_orcamento_email)
LEFT JOIN funcionario fo ON fo.id = uo.id
LEFT JOIN usuario ua ON LOWER(ua.email) = LOWER(d.funcionario_atual_email)
LEFT JOIN funcionario fa ON fa.id = ua.id
LEFT JOIN usuario uf ON LOWER(uf.email) = LOWER(d.funcionario_finalizacao_email)
LEFT JOIN funcionario ff ON ff.id = uf.id
WHERE NOT EXISTS (
    SELECT 1
    FROM solicitacao existente
    WHERE existente.cliente_id = cl.id
      AND existente.descricao_equipamento = d.equipamento
);

-- Histórico cronológico: abertura, orçamento, decisões do cliente e execução.
INSERT INTO historico_solicitacao (solicitacao_id, data_hora, estado_anterior, estado_novo)
SELECT s.id, s.data_hora_abertura, NULL, 'ABERTA'
FROM solicitacao s
JOIN cliente cl ON cl.id = s.cliente_id
JOIN usuario u ON u.id = cl.id
WHERE LOWER(u.email) IN (
    'joao.cliente@example.com', 'jose.cliente@example.com',
    'joana.cliente@example.com', 'joaquina.cliente@example.com'
)
  AND s.descricao_equipamento IN (
    'Notebook Dell Inspiron 15 (demo 01)', 'Desktop Ryzen 5 (demo 02)',
    'Impressora Epson EcoTank L3250 (demo 03)', 'Mouse Logitech M280 (demo 04)',
    'Notebook Lenovo ThinkPad T480 (demo 05)', 'Desktop Dell OptiPlex 7070 (demo 06)',
    'Impressora HP LaserJet Pro M15 (demo 07)', 'Notebook Acer Aspire 5 (demo 08)',
    'Desktop HP ProDesk 400 (demo 09)', 'Teclado mecânico Redragon Kumara (demo 10)',
    'Notebook Samsung Book E30 (demo 11)', 'Impressora Brother HL-L2350DW (demo 12)',
    'Teclado Logitech K380 (demo 13)', 'Desktop Lenovo ThinkCentre M720 (demo 14)',
    'Impressora Canon Pixma G3110 (demo 15)', 'Desktop Asus ExpertCenter D5 (demo 16)',
    'Notebook Positivo Motion C4500 (demo 17)', 'Teclado Microsoft Wired 600 (demo 18)',
    'Desktop Acer Veriton X (demo 19)', 'Notebook Asus VivoBook 15 (demo 20)',
    'Impressora Samsung Xpress M2020 (demo 21)', 'Notebook Dell Latitude 5490 (demo 22)',
    'Desktop Lenovo ThinkCentre M710 (demo 23)', 'Impressora Epson L3150 (demo 24)'
  )
  AND NOT EXISTS (
      SELECT 1 FROM historico_solicitacao h
      WHERE h.solicitacao_id = s.id AND h.estado_novo = 'ABERTA'
  );

WITH eventos (
    cliente_email, equipamento, data_hora, estado_anterior, estado_novo,
    funcionario_email, funcionario_destino_email, valor, motivo,
    descricao_manutencao, orientacoes_cliente
) AS (
    VALUES
        ('joao.cliente@example.com', 'Notebook Lenovo ThinkPad T480 (demo 05)', TIMESTAMP '2026-01-19 09:00:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 280.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Desktop Dell OptiPlex 7070 (demo 06)', TIMESTAMP '2026-04-04 10:15:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 420.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Impressora HP LaserJet Pro M15 (demo 07)', TIMESTAMP '2026-09-03 08:40:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 195.50, NULL::TEXT, NULL::TEXT, NULL::TEXT),

        ('joao.cliente@example.com', 'Notebook Acer Aspire 5 (demo 08)', TIMESTAMP '2026-02-12 09:10:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 560.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Notebook Acer Aspire 5 (demo 08)', TIMESTAMP '2026-02-13 11:20:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 560.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Desktop HP ProDesk 400 (demo 09)', TIMESTAMP '2026-05-23 10:20:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 310.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Desktop HP ProDesk 400 (demo 09)', TIMESTAMP '2026-05-24 13:05:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 310.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Teclado mecânico Redragon Kumara (demo 10)', TIMESTAMP '2026-10-05 08:30:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 145.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Teclado mecânico Redragon Kumara (demo 10)', TIMESTAMP '2026-10-06 10:00:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 145.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),

        ('joaquina.cliente@example.com', 'Notebook Samsung Book E30 (demo 11)', TIMESTAMP '2026-03-01 11:00:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 390.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Notebook Samsung Book E30 (demo 11)', TIMESTAMP '2026-03-02 09:30:00', 'ORÇADA', 'REJEITADA', NULL::VARCHAR, NULL::VARCHAR, 390.00, 'O valor ficou acima do orçamento disponível no momento.', NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Impressora Brother HL-L2350DW (demo 12)', TIMESTAMP '2026-06-16 08:15:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 220.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Impressora Brother HL-L2350DW (demo 12)', TIMESTAMP '2026-06-17 14:20:00', 'ORÇADA', 'REJEITADA', NULL::VARCHAR, NULL::VARCHAR, 220.00, 'O cliente optou por não realizar o reparo neste momento.', NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Teclado Logitech K380 (demo 13)', TIMESTAMP '2026-07-08 09:05:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 125.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Teclado Logitech K380 (demo 13)', TIMESTAMP '2026-07-09 10:40:00', 'ORÇADA', 'REJEITADA', NULL::VARCHAR, NULL::VARCHAR, 125.00, 'Solicito um tempo para avaliar o orçamento.', NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Teclado Logitech K380 (demo 13)', TIMESTAMP '2026-07-12 16:10:00', 'REJEITADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 125.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),

        ('joana.cliente@example.com', 'Desktop Lenovo ThinkCentre M720 (demo 14)', TIMESTAMP '2026-03-20 10:00:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 680.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Desktop Lenovo ThinkCentre M720 (demo 14)', TIMESTAMP '2026-03-21 09:25:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 680.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Desktop Lenovo ThinkCentre M720 (demo 14)', TIMESTAMP '2026-03-22 11:00:00', 'APROVADA', 'REDIRECIONADA', 'maria.funcionario@example.com', 'mario.funcionario@example.com', NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Impressora Canon Pixma G3110 (demo 15)', TIMESTAMP '2026-08-12 09:30:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 215.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Impressora Canon Pixma G3110 (demo 15)', TIMESTAMP '2026-08-13 13:15:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 215.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Impressora Canon Pixma G3110 (demo 15)', TIMESTAMP '2026-08-14 08:55:00', 'APROVADA', 'REDIRECIONADA', 'mario.funcionario@example.com', 'maria.funcionario@example.com', NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Impressora Canon Pixma G3110 (demo 15)', TIMESTAMP '2026-08-15 10:05:00', 'REDIRECIONADA', 'REDIRECIONADA', 'maria.funcionario@example.com', 'mario.funcionario@example.com', NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Desktop Asus ExpertCenter D5 (demo 16)', TIMESTAMP '2026-10-19 10:45:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 845.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Desktop Asus ExpertCenter D5 (demo 16)', TIMESTAMP '2026-10-20 12:00:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 845.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Desktop Asus ExpertCenter D5 (demo 16)', TIMESTAMP '2026-10-21 09:35:00', 'APROVADA', 'REDIRECIONADA', 'mario.funcionario@example.com', 'maria.funcionario@example.com', NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT),

        ('jose.cliente@example.com', 'Notebook Positivo Motion C4500 (demo 17)', TIMESTAMP '2026-04-17 08:50:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 295.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Notebook Positivo Motion C4500 (demo 17)', TIMESTAMP '2026-04-18 10:30:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 295.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Notebook Positivo Motion C4500 (demo 17)', TIMESTAMP '2026-04-21 14:15:00', 'APROVADA', 'ARRUMADA', 'maria.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Substituição do módulo de refrigeração e limpeza interna.', 'Aguardar alguns minutos antes de transportar o notebook após o uso.'),
        ('joana.cliente@example.com', 'Teclado Microsoft Wired 600 (demo 18)', TIMESTAMP '2026-06-28 09:15:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 135.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Teclado Microsoft Wired 600 (demo 18)', TIMESTAMP '2026-06-29 11:10:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 135.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Teclado Microsoft Wired 600 (demo 18)', TIMESTAMP '2026-07-01 15:40:00', 'APROVADA', 'ARRUMADA', 'mario.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Reparo da conexão do cabo e substituição do trecho danificado.', 'Evitar dobrar ou tensionar o cabo próximo ao conector.'),
        ('joaquina.cliente@example.com', 'Desktop Acer Veriton X (demo 19)', TIMESTAMP '2026-09-15 11:25:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 470.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Desktop Acer Veriton X (demo 19)', TIMESTAMP '2026-09-16 14:00:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 470.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Desktop Acer Veriton X (demo 19)', TIMESTAMP '2026-09-19 09:50:00', 'APROVADA', 'ARRUMADA', 'mario.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Substituição do cabo de vídeo interno e teste de imagem.', 'Manter o gabinete em local ventilado e sem obstruir as saídas de ar.'),

        ('joao.cliente@example.com', 'Notebook Asus VivoBook 15 (demo 20)', TIMESTAMP '2026-05-07 09:20:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 355.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Notebook Asus VivoBook 15 (demo 20)', TIMESTAMP '2026-05-08 13:30:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 355.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Notebook Asus VivoBook 15 (demo 20)', TIMESTAMP '2026-05-10 16:45:00', 'APROVADA', 'ARRUMADA', 'maria.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Substituição da bateria e revisão do circuito de carga.', 'Realizar um ciclo completo de carga antes do primeiro uso prolongado.'),
        ('joao.cliente@example.com', 'Notebook Asus VivoBook 15 (demo 20)', TIMESTAMP '2026-05-11 14:00:00', 'ARRUMADA', 'PAGA', NULL::VARCHAR, NULL::VARCHAR, 355.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Impressora Samsung Xpress M2020 (demo 21)', TIMESTAMP '2026-10-02 10:10:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 235.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Impressora Samsung Xpress M2020 (demo 21)', TIMESTAMP '2026-10-03 12:25:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 235.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('jose.cliente@example.com', 'Impressora Samsung Xpress M2020 (demo 21)', TIMESTAMP '2026-10-06 09:35:00', 'APROVADA', 'ARRUMADA', 'mario.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Reparo da interface USB e reinstalação do firmware.', 'Utilizar cabo USB certificado e evitar desconectar durante a impressão.'),
        ('jose.cliente@example.com', 'Impressora Samsung Xpress M2020 (demo 21)', TIMESTAMP '2026-10-08 16:30:00', 'ARRUMADA', 'PAGA', NULL::VARCHAR, NULL::VARCHAR, 235.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),

        ('joana.cliente@example.com', 'Notebook Dell Latitude 5490 (demo 22)', TIMESTAMP '2026-01-28 09:00:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 640.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Notebook Dell Latitude 5490 (demo 22)', TIMESTAMP '2026-01-29 10:10:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 640.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Notebook Dell Latitude 5490 (demo 22)', TIMESTAMP '2026-01-31 14:25:00', 'APROVADA', 'ARRUMADA', 'maria.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Substituição do conector DC-in e teste de estabilidade da alimentação.', 'Manusear o plugue do carregador sem forçar o conector.'),
        ('joana.cliente@example.com', 'Notebook Dell Latitude 5490 (demo 22)', TIMESTAMP '2026-02-02 11:35:00', 'ARRUMADA', 'PAGA', NULL::VARCHAR, NULL::VARCHAR, 640.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joana.cliente@example.com', 'Notebook Dell Latitude 5490 (demo 22)', TIMESTAMP '2026-02-03 08:30:00', 'PAGA', 'FINALIZADA', 'maria.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Desktop Lenovo ThinkCentre M710 (demo 23)', TIMESTAMP '2026-05-31 10:30:00', 'ABERTA', 'ORÇADA', 'mario.funcionario@example.com', NULL::VARCHAR, 525.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Desktop Lenovo ThinkCentre M710 (demo 23)', TIMESTAMP '2026-06-01 09:45:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 525.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Desktop Lenovo ThinkCentre M710 (demo 23)', TIMESTAMP '2026-06-03 15:20:00', 'APROVADA', 'ARRUMADA', 'mario.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Substituição do disco e recuperação dos dados acessíveis.', 'Manter cópias de segurança periódicas dos arquivos importantes.'),
        ('joaquina.cliente@example.com', 'Desktop Lenovo ThinkCentre M710 (demo 23)', TIMESTAMP '2026-06-05 15:15:00', 'ARRUMADA', 'PAGA', NULL::VARCHAR, NULL::VARCHAR, 525.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joaquina.cliente@example.com', 'Desktop Lenovo ThinkCentre M710 (demo 23)', TIMESTAMP '2026-06-06 09:40:00', 'PAGA', 'FINALIZADA', 'mario.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Impressora Epson L3150 (demo 24)', TIMESTAMP '2026-07-21 08:45:00', 'ABERTA', 'ORÇADA', 'maria.funcionario@example.com', NULL::VARCHAR, 185.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Impressora Epson L3150 (demo 24)', TIMESTAMP '2026-07-22 10:30:00', 'ORÇADA', 'APROVADA', NULL::VARCHAR, NULL::VARCHAR, 185.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Impressora Epson L3150 (demo 24)', TIMESTAMP '2026-07-24 13:50:00', 'APROVADA', 'ARRUMADA', 'maria.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, 'Limpeza do cabeçote e alinhamento do conjunto de impressão.', 'Utilizar a impressora semanalmente para evitar ressecamento da tinta.'),
        ('joao.cliente@example.com', 'Impressora Epson L3150 (demo 24)', TIMESTAMP '2026-07-25 12:10:00', 'ARRUMADA', 'PAGA', NULL::VARCHAR, NULL::VARCHAR, 185.00, NULL::TEXT, NULL::TEXT, NULL::TEXT),
        ('joao.cliente@example.com', 'Impressora Epson L3150 (demo 24)', TIMESTAMP '2026-07-26 10:20:00', 'PAGA', 'FINALIZADA', 'maria.funcionario@example.com', NULL::VARCHAR, NULL::NUMERIC, NULL::TEXT, NULL::TEXT, NULL::TEXT)
)
INSERT INTO historico_solicitacao (
    solicitacao_id, data_hora, estado_anterior, estado_novo, funcionario_id,
    funcionario_destino_id, valor, motivo, descricao_manutencao, orientacoes_cliente
)
SELECT s.id, e.data_hora, e.estado_anterior, e.estado_novo, f.id, fd.id,
       e.valor, e.motivo, e.descricao_manutencao, e.orientacoes_cliente
FROM eventos e
JOIN usuario uc ON LOWER(uc.email) = LOWER(e.cliente_email)
JOIN solicitacao s ON s.cliente_id = uc.id
    AND s.descricao_equipamento = e.equipamento
LEFT JOIN usuario ufe ON LOWER(ufe.email) = LOWER(e.funcionario_email)
LEFT JOIN funcionario f ON f.id = ufe.id
LEFT JOIN usuario ude ON LOWER(ude.email) = LOWER(e.funcionario_destino_email)
LEFT JOIN funcionario fd ON fd.id = ude.id
WHERE NOT EXISTS (
    SELECT 1
    FROM historico_solicitacao existente
    WHERE existente.solicitacao_id = s.id
      AND existente.data_hora = e.data_hora
      AND existente.estado_novo = e.estado_novo
);
