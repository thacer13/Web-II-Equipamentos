package br.ufpr.tads.webequipamentos.dao;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ManutencaoDaoImpl implements ManutencaoDao {

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

    private static final String CONCLUIR = """
        UPDATE solicitacao s
           SET estado = 'ARRUMADA',
               funcionario_atual_id = f.id
          FROM funcionario f
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
           AND f.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
           AND s.estado = ?
        """;

    private static final String REGISTRAR_HISTORICO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo, funcionario_id,
             descricao_manutencao, orientacoes_cliente)
        SELECT s.id, NOW(), ?, 'ARRUMADA', f.id, ?, ?
          FROM solicitacao s
          JOIN funcionario f ON f.id = s.funcionario_atual_id
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
           AND s.estado = 'ARRUMADA'
        """;

    private final JdbcTemplate jdbc;

    public ManutencaoDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<String> buscarEstadoDoFuncionario(Integer solicitacaoId, String emailFuncionario) {
        return jdbc.query(BUSCAR_ESTADO, (rs, rowNum) -> rs.getString("estado"),
                solicitacaoId, emailFuncionario).stream().findFirst();
    }

    @Override
    public int concluir(Integer solicitacaoId, String emailFuncionario, String estadoAtual) {
        return jdbc.update(CONCLUIR, solicitacaoId, emailFuncionario, estadoAtual);
    }

    @Override
    public int registrarHistorico(Integer solicitacaoId, String emailFuncionario, String estadoAnterior,
                                  String descricaoManutencao, String orientacoesCliente) {
        return jdbc.update(REGISTRAR_HISTORICO, estadoAnterior, descricaoManutencao, orientacoesCliente,
                solicitacaoId, emailFuncionario);
    }
}
