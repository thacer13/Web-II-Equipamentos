SELECT
    c.id,
    u.nome,
    u.email,
    c.cpf,
    c.telefone
FROM cliente c
JOIN usuario u
    ON u.id = c.id
ORDER BY u.nome;


SELECT
    f.id,
    u.nome,
    u.email,
    f.data_nascimento
FROM funcionario f
JOIN usuario u
    ON u.id = f.id
WHERE f.ativo = TRUE
ORDER BY u.nome;


SELECT
    id,
    nome
FROM categoria_equipamento
WHERE ativo = TRUE
ORDER BY nome;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    c.nome AS categoria,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento c
    ON c.id = s.categoria_id
WHERE s.estado = 'ABERTA'
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    c.nome AS categoria,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado,
    s.valor_orcamento
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento c
    ON c.id = s.categoria_id
ORDER BY s.data_hora_abertura ASC;


SELECT
    h.id,
    h.solicitacao_id,
    h.data_hora,
    h.estado_anterior,
    h.estado_novo,
    h.valor,
    h.motivo,
    h.descricao_manutencao,
    h.orientacoes_cliente
FROM historico_solicitacao h
WHERE h.solicitacao_id = 1
ORDER BY h.data_hora ASC;


SELECT
    DATE(s.data_hora_pagamento) AS dia,
    COUNT(s.id) AS quantidade,
    SUM(s.valor_orcamento) AS receita
FROM solicitacao s
WHERE s.data_hora_pagamento IS NOT NULL
  AND DATE(s.data_hora_pagamento)
      BETWEEN '2026-09-01' AND '2026-09-30'
GROUP BY DATE(s.data_hora_pagamento)
ORDER BY dia ASC;


SELECT
    c.nome AS categoria,
    COUNT(s.id) AS quantidade,
    SUM(s.valor_orcamento) AS receita
FROM solicitacao s
JOIN categoria_equipamento c
    ON c.id = s.categoria_id
WHERE s.data_hora_pagamento IS NOT NULL
GROUP BY c.id, c.nome
ORDER BY c.nome;


SELECT
    u.id,
    u.nome,
    u.email,
    u.senha_hash,
    u.salt,
    CASE
        WHEN f.id IS NOT NULL THEN 'FUNCIONARIO'
        WHEN c.id IS NOT NULL THEN 'CLIENTE'
        ELSE 'SEM_PERFIL'
    END AS perfil
FROM usuario u
LEFT JOIN funcionario f
    ON f.id = u.id
LEFT JOIN cliente c
    ON c.id = u.id
WHERE LOWER(u.email) = LOWER('usuario@exemplo.com');


SELECT
    s.id,
    s.data_hora_abertura,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado,
    s.valor_orcamento,
    cat.nome AS categoria
FROM solicitacao s
JOIN categoria_equipamento cat
    ON cat.id = s.categoria_id
WHERE s.cliente_id = 1
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id AS solicitacao_id,
    s.data_hora_abertura,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado,
    s.valor_orcamento,
    cat.nome AS categoria,
    cl.cpf,
    cl.telefone,
    u.nome AS cliente,
    u.email,
    e.cep,
    e.logradouro,
    e.numero,
    e.complemento,
    e.bairro,
    e.cidade,
    e.estado AS uf
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento cat
    ON cat.id = s.categoria_id
JOIN endereco e
    ON e.id = cl.endereco_id
WHERE s.id = 1;


SELECT
    h.id,
    h.solicitacao_id,
    h.data_hora,
    h.estado_anterior,
    h.estado_novo,
    h.valor,
    h.motivo,
    h.descricao_manutencao,
    h.orientacoes_cliente,
    u.nome AS funcionario
FROM historico_solicitacao h
LEFT JOIN funcionario f
    ON f.id = h.funcionario_id
LEFT JOIN usuario u
    ON u.id = f.id
WHERE h.solicitacao_id = 1
ORDER BY h.data_hora ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    cat.nome AS categoria,
    s.descricao_equipamento,
    s.estado
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento cat
    ON cat.id = s.categoria_id
WHERE DATE(s.data_hora_abertura) = CURRENT_DATE
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    s.descricao_equipamento,
    s.estado
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
WHERE DATE(s.data_hora_abertura)
      BETWEEN DATE '2026-09-01' AND DATE '2026-09-30'
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    s.descricao_equipamento,
    s.estado
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
WHERE
    s.estado <> 'REDIRECIONADA'
    OR s.funcionario_atual_id = 1
ORDER BY s.data_hora_abertura ASC;


SELECT
    f.id,
    u.nome,
    u.email,
    f.data_nascimento
FROM funcionario f
JOIN usuario u
    ON u.id = f.id
WHERE f.ativo = TRUE
  AND f.id <> 1
ORDER BY u.nome ASC;