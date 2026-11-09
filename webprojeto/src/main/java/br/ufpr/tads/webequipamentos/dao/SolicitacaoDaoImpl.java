package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    private static final String SELECT_RESUMO = """
        SELECT s.id, s.data_hora_abertura, s.descricao_equipamento,
               s.descricao_defeito, c.nome AS categoria_equipamento,
               s.estado, s.valor_orcamento
        FROM solicitacao s
        JOIN categoria_equipamento c ON c.id = s.categoria_id
        """;

    // O cliente é sempre o dono da sessão; nunca vem da URL nem do corpo da requisição.
    private static final String SELECT_DO_CLIENTE = SELECT_RESUMO + """
        JOIN usuario u ON u.id = s.cliente_id
        WHERE LOWER(u.email) = LOWER(?)
        ORDER BY s.data_hora_abertura ASC, s.id ASC
        """;

    // Só insere se o e-mail for de um cliente e a categoria existir e estiver ativa.
    private static final String INSERT_SOLICITACAO = """
        INSERT INTO solicitacao
            (cliente_id, categoria_id, descricao_equipamento, descricao_defeito, estado)
        SELECT cl.id, cat.id, ?, ?, 'ABERTA'
        FROM cliente cl
        JOIN usuario u ON u.id = cl.id
        JOIN categoria_equipamento cat ON cat.id = ? AND cat.ativo = TRUE
        WHERE LOWER(u.email) = LOWER(?)
        RETURNING id
        """;

    private static final String INSERT_HISTORICO_ABERTURA = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo)
        SELECT id, data_hora_abertura, NULL, 'ABERTA'
        FROM solicitacao
        WHERE id = ?
        """;

    private static final RowMapper<SolicitacaoResumo> MAPPER = (rs, rowNum) -> new SolicitacaoResumo(
        rs.getInt("id"),
        rs.getTimestamp("data_hora_abertura").toLocalDateTime(),
        rs.getString("descricao_equipamento"),
        rs.getString("descricao_defeito"),
        rs.getString("categoria_equipamento"),
        rs.getString("estado"),
        rs.getBigDecimal("valor_orcamento")
    );

    private final JdbcTemplate jdbc;

    public SolicitacaoDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<SolicitacaoResumo> listarVisiveis(String emailFuncionario) {
        return jdbc.query(SELECT_VISIVEIS, MAPPER, emailFuncionario);
    }

    @Override
    public List<SolicitacaoResumo> listarDoCliente(String emailCliente) {
        return jdbc.query(SELECT_DO_CLIENTE, MAPPER, emailCliente);
    }

    @Override
    public Optional<Integer> inserir(String emailCliente, Integer categoriaId,
                                     String descricaoEquipamento, String descricaoDefeito) {
        return jdbc.query(INSERT_SOLICITACAO, (rs, rowNum) -> rs.getInt("id"),
                descricaoEquipamento, descricaoDefeito, categoriaId, emailCliente)
            .stream()
            .findFirst();
    }

    @Override
    public void registrarAbertura(Integer solicitacaoId) {
        jdbc.update(INSERT_HISTORICO_ABERTURA, solicitacaoId);
    }

    @Override
    public Optional<SolicitacaoResumo> buscarResumo(Integer id) {
        return jdbc.query(SELECT_RESUMO + " WHERE s.id = ?", MAPPER, id)
            .stream()
            .findFirst();
    }
}
