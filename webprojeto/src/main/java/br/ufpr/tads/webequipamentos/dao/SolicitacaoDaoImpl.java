
package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SolicitacaoDaoImpl implements SolicitacaoDao {

    private static final String SELECT_VISIVEIS = """
        WITH funcionario_logado AS (
            SELECT f.id
            FROM funcionario f
            JOIN usuario u ON u.id = f.id
            WHERE LOWER(u.email) = LOWER(?) AND f.ativo = TRUE
        )
        SELECT s.id, s.data_hora_abertura, s.descricao_equipamento,
               s.descricao_defeito, c.nome AS categoria_equipamento,
               s.estado, s.valor_orcamento
        FROM solicitacao s
        JOIN categoria_equipamento c ON c.id = s.categoria_id
        CROSS JOIN funcionario_logado f
        WHERE (s.estado = 'ABERTA'
               AND s.funcionario_atual_id IS NULL
               AND s.funcionario_orcamento_id IS NULL)
           OR (CASE
                 WHEN s.estado = 'REDIRECIONADA' THEN s.funcionario_atual_id
                 ELSE COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
               END) = f.id
        ORDER BY s.data_hora_abertura ASC, s.id ASC
        """;

    private final JdbcTemplate jdbc;

    public SolicitacaoDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<SolicitacaoResumo> listarVisiveis(String emailFuncionario) {
        return jdbc.query(SELECT_VISIVEIS, (rs, rowNum) -> new SolicitacaoResumo(
            rs.getInt("id"),
            rs.getTimestamp("data_hora_abertura").toLocalDateTime(),
            rs.getString("descricao_equipamento"),
            rs.getString("descricao_defeito"),
            rs.getString("categoria_equipamento"),
            rs.getString("estado"),
            rs.getBigDecimal("valor_orcamento")
        ), emailFuncionario);
    }
}
