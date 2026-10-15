SELECT
    id,
    email
FROM usuario
WHERE LOWER(email) = LOWER('cliente@email.com');


SELECT
    id,
    cpf
FROM cliente
WHERE cpf = '12345678900';


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
    c.id,
    u.nome,
    u.email,
    c.cpf,
    c.telefone
FROM cliente c
JOIN usuario u
    ON u.id = c.id
ORDER BY u.nome ASC;


SELECT
    f.id,
    u.nome,
    u.email,
    f.data_nascimento
FROM funcionario f
JOIN usuario u
    ON u.id = f.id
WHERE f.ativo = TRUE
ORDER BY u.nome ASC;


SELECT
    id,
    nome
FROM categoria_equipamento
WHERE ativo = TRUE
ORDER BY nome ASC;


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
    s.id AS solicitacao_id,
    s.data_hora_abertura,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado,
    s.valor_orcamento,
    s.data_hora_orcamento,
    s.data_hora_pagamento,
    s.data_hora_finalizacao,
    cat.id AS categoria_id,
    cat.nome AS categoria,
    cl.id AS cliente_id,
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
    uf.nome AS funcionario,
    ud.nome AS funcionario_destino
FROM historico_solicitacao h
LEFT JOIN funcionario f
    ON f.id = h.funcionario_id
LEFT JOIN usuario uf
    ON uf.id = f.id
LEFT JOIN funcionario fd
    ON fd.id = h.funcionario_destino_id
LEFT JOIN usuario ud
    ON ud.id = fd.id
WHERE h.solicitacao_id = 1
ORDER BY h.data_hora ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    cat.nome AS categoria,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado,
    s.valor_orcamento
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento cat
    ON cat.id = s.categoria_id
WHERE
    s.estado <> 'REDIRECIONADA'
    OR s.funcionario_atual_id = 1
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    cat.nome AS categoria,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento cat
    ON cat.id = s.categoria_id
WHERE DATE(s.data_hora_abertura) = CURRENT_DATE
  AND (
        s.estado <> 'REDIRECIONADA'
        OR s.funcionario_atual_id = 1
      )
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    u.nome AS cliente,
    cat.nome AS categoria,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado
FROM solicitacao s
JOIN cliente cl
    ON cl.id = s.cliente_id
JOIN usuario u
    ON u.id = cl.id
JOIN categoria_equipamento cat
    ON cat.id = s.categoria_id
WHERE DATE(s.data_hora_abertura)
      BETWEEN DATE '2026-09-01' AND DATE '2026-09-30'
  AND (
        s.estado <> 'REDIRECIONADA'
        OR s.funcionario_atual_id = 1
      )
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


SELECT
    h.id,
    h.solicitacao_id,
    h.data_hora,
    origem.nome AS funcionario_origem,
    destino.nome AS funcionario_destino,
    h.estado_anterior,
    h.estado_novo
FROM historico_solicitacao h
LEFT JOIN funcionario fo
    ON fo.id = h.funcionario_id
LEFT JOIN usuario origem
    ON origem.id = fo.id
LEFT JOIN funcionario fd
    ON fd.id = h.funcionario_destino_id
LEFT JOIN usuario destino
    ON destino.id = fd.id
WHERE h.solicitacao_id = 1
  AND h.funcionario_destino_id IS NOT NULL
ORDER BY h.data_hora ASC;


SELECT
    s.id,
    s.data_hora_abertura,
    s.descricao_equipamento,
    s.descricao_defeito,
    s.estado,
    s.valor_orcamento,
    s.data_hora_orcamento,
    u.nome AS funcionario_orcamento
FROM solicitacao s
LEFT JOIN funcionario f
    ON f.id = s.funcionario_orcamento_id
LEFT JOIN usuario u
    ON u.id = f.id
WHERE s.id = 1;


SELECT
    s.id,
    s.data_hora_abertura,
    s.descricao_equipamento,
    s.estado,
    s.funcionario_atual_id,
    u.nome AS funcionario_atual
FROM solicitacao s
LEFT JOIN funcionario f
    ON f.id = s.funcionario_atual_id
LEFT JOIN usuario u
    ON u.id = f.id
WHERE s.estado = 'REDIRECIONADA'
  AND s.funcionario_atual_id = 1
ORDER BY s.data_hora_abertura ASC;


SELECT
    s.id,
    s.descricao_equipamento,
    s.estado,
    s.valor_orcamento,
    s.data_hora_pagamento
FROM solicitacao s
WHERE s.estado = 'PAGA'
ORDER BY s.data_hora_pagamento ASC;


SELECT
    s.id,
    s.descricao_equipamento,
    s.estado,
    s.data_hora_finalizacao,
    u.nome AS funcionario_finalizacao
FROM solicitacao s
LEFT JOIN funcionario f
    ON f.id = s.funcionario_finalizacao_id
LEFT JOIN usuario u
    ON u.id = f.id
WHERE s.data_hora_finalizacao IS NOT NULL
ORDER BY s.data_hora_finalizacao ASC;


WITH parametros AS (
    SELECT
        NULL::DATE AS data_inicial,
        NULL::DATE AS data_final
)
SELECT
    DATE(s.data_hora_pagamento) AS dia,
    COUNT(s.id) AS quantidade,
    COALESCE(SUM(s.valor_orcamento), 0) AS receita
FROM solicitacao s
CROSS JOIN parametros p
WHERE s.data_hora_pagamento IS NOT NULL
  AND (
        p.data_inicial IS NULL
        OR DATE(s.data_hora_pagamento) >= p.data_inicial
      )
  AND (
        p.data_final IS NULL
        OR DATE(s.data_hora_pagamento) <= p.data_final
      )
GROUP BY DATE(s.data_hora_pagamento)
ORDER BY dia ASC;


SELECT
    c.nome AS categoria,
    COUNT(s.id) AS quantidade,
    COALESCE(SUM(s.valor_orcamento), 0) AS receita
FROM solicitacao s
JOIN categoria_equipamento c
    ON c.id = s.categoria_id
WHERE s.data_hora_pagamento IS NOT NULL
GROUP BY c.id, c.nome
ORDER BY c.nome ASC;