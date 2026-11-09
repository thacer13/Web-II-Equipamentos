-- Contas de exemplo para desenvolvimento local; a senha de todas e 1234.
INSERT INTO usuario (nome, email, senha_hash, salt)
VALUES
    ('Maria', 'maria.funcionario@example.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', ''),
    ('Mário', 'mario.funcionario@example.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', ''),
    ('João', 'joao.cliente@example.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', ''),
    ('José', 'jose.cliente@example.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', ''),
    ('Joana', 'joana.cliente@example.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', ''),
    ('Joaquina', 'joaquina.cliente@example.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '')
ON CONFLICT (email) DO NOTHING;

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
