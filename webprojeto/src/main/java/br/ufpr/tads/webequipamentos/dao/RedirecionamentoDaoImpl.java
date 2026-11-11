package br.ufpr.tads.webequipamentos.dao;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RedirecionamentoDaoImpl implements RedirecionamentoDao {

    private static final String BUSCAR_ORIGEM = """
        SELECT s.estado, f.id AS funcionario_origem_id
          FROM solicitacao s
          JOIN funcionario f
            ON f.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
        """;

    private static final String FUNCIONARIO_ATIVO = """
        SELECT COUNT(*)
          FROM funcionario
         WHERE id = ?
           AND ativo = TRUE
        """;

    private static final String REDIRECIONAR = """
        UPDATE solicitacao s
           SET estado = 'REDIRECIONADA',
               funcionario_atual_id = ?
         WHERE s.id = ?
           AND s.estado = ?
        """;

    private static final String REGISTRAR_HISTORICO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo, funcionario_id, funcionario_destino_id)
        VALUES (?, NOW(), ?, 'REDIRECIONADA', ?, ?)
        """;

    private final JdbcTemplate jdbc;

    public RedirecionamentoDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<OrigemSolicitacao> buscarOrigem(Integer solicitacaoId, String emailFuncionario) {
        return jdbc.query(BUSCAR_ORIGEM, (rs, rowNum) -> new OrigemSolicitacao(
            rs.getString("estado"),
            rs.getInt("funcionario_origem_id")
        ), solicitacaoId, emailFuncionario).stream().findFirst();
    }

    @Override
    public boolean funcionarioAtivo(int funcionarioId) {
        Integer count = jdbc.queryForObject(FUNCIONARIO_ATIVO, Integer.class, funcionarioId);
        return count != null && count > 0;
    }

    @Override
    public int redirecionar(Integer solicitacaoId, int funcionarioDestinoId, String estadoAtual) {
        return jdbc.update(REDIRECIONAR, funcionarioDestinoId, solicitacaoId, estadoAtual);
    }

    @Override
    public int registrarHistorico(Integer solicitacaoId, int funcionarioOrigemId, int funcionarioDestinoId, String estadoAnterior) {
        return jdbc.update(REGISTRAR_HISTORICO, solicitacaoId, estadoAnterior, funcionarioOrigemId, funcionarioDestinoId);
    }
}
