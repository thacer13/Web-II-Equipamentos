package br.ufpr.tads.webequipamentos.dao;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FinalizacaoDaoImpl implements FinalizacaoDao {

    private final JdbcTemplate jdbc;

    public FinalizacaoDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BUSCAR_ESTADO = """
        SELECT s.estado
          FROM solicitacao s
          JOIN funcionario f
            ON f.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
        """;

    private static final String FINALIZAR = """
        UPDATE solicitacao s
           SET estado = 'FINALIZADA',
               funcionario_finalizacao_id = f.id,
               data_hora_finalizacao = NOW()
          FROM funcionario f
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
           AND f.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
           AND s.estado = 'PAGA'
           AND s.data_hora_pagamento IS NOT NULL
           AND s.data_hora_finalizacao IS NULL
        """;

    private static final String REGISTRAR_HISTORICO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo, funcionario_id)
        SELECT s.id, s.data_hora_finalizacao, 'PAGA', 'FINALIZADA', s.funcionario_finalizacao_id
          FROM solicitacao s
          JOIN funcionario f ON f.id = s.funcionario_finalizacao_id
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND s.estado = 'FINALIZADA'
           AND s.data_hora_finalizacao IS NOT NULL
        """;

    @Override
    public Optional<String> buscarEstadoDoFuncionario(Integer solicitacaoId, String emailFuncionario) {
        return jdbc.query(BUSCAR_ESTADO, (rs, rowNum) -> rs.getString("estado"),
                solicitacaoId, emailFuncionario).stream().findFirst();
    }

    @Override
    public int finalizar(Integer solicitacaoId, String emailFuncionario) {
        return jdbc.update(FINALIZAR, solicitacaoId, emailFuncionario);
    }

    @Override
    public int registrarFinalizacao(Integer solicitacaoId, String emailFuncionario) {
        return jdbc.update(REGISTRAR_HISTORICO, solicitacaoId, emailFuncionario);
    }
}