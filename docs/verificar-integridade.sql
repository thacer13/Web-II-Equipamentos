-- Verificação de integridade das solicitações e do histórico (T37; usar também no T25/T40).
-- Rodar: psql -h localhost -U dev_user -d manutencao_db -f docs/verificar-integridade.sql
-- Todas as colunas, exceto "solicitacoes", devem ser 0.
WITH h AS (
    SELECT h.*,
           LAG(estado_novo) OVER (PARTITION BY solicitacao_id ORDER BY data_hora, id) AS anterior_real,
           ROW_NUMBER() OVER (PARTITION BY solicitacao_id ORDER BY data_hora DESC, id DESC) AS rn
    FROM historico_solicitacao h
)
SELECT
    (SELECT COUNT(*) FROM solicitacao) AS solicitacoes,
    -- toda solicitação tem pelo menos o registro de abertura
    (SELECT COUNT(*) FROM solicitacao s
      WHERE NOT EXISTS (SELECT 1 FROM historico_solicitacao x WHERE x.solicitacao_id = s.id)) AS sem_historico,
    -- o último histórico bate com o estado atual
    (SELECT COUNT(*) FROM h
      WHERE rn = 1 AND estado_novo <> (SELECT estado FROM solicitacao s WHERE s.id = h.solicitacao_id)) AS ultimo_historico_diverge,
    -- cada registro parte do estado em que o anterior terminou
    (SELECT COUNT(*) FROM h WHERE estado_anterior IS DISTINCT FROM anterior_real) AS cadeia_quebrada,
    -- orçamento sempre com funcionário e valor
    (SELECT COUNT(*) FROM h WHERE estado_novo = 'ORÇADA' AND (funcionario_id IS NULL OR valor IS NULL)) AS orcamento_incompleto,
    -- redirecionamento sempre com origem e destino diferentes
    (SELECT COUNT(*) FROM h WHERE estado_novo = 'REDIRECIONADA'
        AND (funcionario_id IS NULL OR funcionario_destino_id IS NULL OR funcionario_id = funcionario_destino_id)) AS redirecionamento_incompleto,
    -- finalização sempre com funcionário
    (SELECT COUNT(*) FROM h WHERE estado_novo = 'FINALIZADA' AND funcionario_id IS NULL) AS finalizacao_sem_funcionario;
