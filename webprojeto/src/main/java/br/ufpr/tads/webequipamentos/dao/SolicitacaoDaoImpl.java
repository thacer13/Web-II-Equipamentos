package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ClienteDaSolicitacao;
import br.ufpr.tads.webequipamentos.dto.HistoricoItem;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoAberta;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class SolicitacaoDaoImpl implements SolicitacaoDao {

    // RF013: abertas sem responsável aparecem para todos; as demais só para o responsável.
    // REDIRECIONADA vale só para o funcionário de destino (funcionario_atual_id), como pede o enunciado.
    // A mesma regra serve para a listagem e para o detalhe, para trocar o id na URL não expor nada.
    private static final String FROM_VISIVEIS = """
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
        WHERE ((s.estado = 'ABERTA'
                AND s.funcionario_atual_id IS NULL
                AND s.funcionario_orcamento_id IS NULL)
            OR (CASE
                  WHEN s.estado = 'REDIRECIONADA' THEN s.funcionario_atual_id
                  ELSE COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
                END) = f.id)
        """;

    private static final String SELECT_VISIVEIS = FROM_VISIVEIS + """
        ORDER BY s.data_hora_abertura ASC, s.id ASC
        """;

    private static final String SELECT_UMA_VISIVEL = FROM_VISIVEIS + """
          AND s.id = ?
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
        JOIN cliente cl ON cl.id = s.cliente_id AND cl.ativo = TRUE
        JOIN usuario u ON u.id = s.cliente_id
        WHERE LOWER(u.email) = LOWER(?)
        ORDER BY s.data_hora_abertura ASC, s.id ASC
        """;

    // RF011: todas as abertas, da mais antiga para a mais recente, para qualquer funcionário orçar.
    private static final String SELECT_ABERTAS = """
        SELECT s.id, s.data_hora_abertura, u.nome AS cliente, s.descricao_equipamento,
               c.nome AS categoria_equipamento, s.descricao_defeito
        FROM solicitacao s
        JOIN usuario u ON u.id = s.cliente_id
        JOIN categoria_equipamento c ON c.id = s.categoria_id
        WHERE s.estado = 'ABERTA'
        ORDER BY s.data_hora_abertura ASC, s.id ASC
        """;

    private static final String SELECT_UMA_DO_CLIENTE = SELECT_RESUMO + """
        JOIN cliente cl ON cl.id = s.cliente_id AND cl.ativo = TRUE
        JOIN usuario u ON u.id = s.cliente_id
        WHERE s.id = ? AND LOWER(u.email) = LOWER(?)
        """;

    // Nomes dos funcionários vêm de usuario; eventos do cliente ficam sem funcionário.
    private static final String SELECT_HISTORICO = """
        SELECT h.data_hora, h.estado_anterior, h.estado_novo,
               uf.nome AS funcionario, ud.nome AS funcionario_destino,
               h.valor, h.motivo, h.descricao_manutencao, h.orientacoes_cliente
        FROM historico_solicitacao h
        LEFT JOIN usuario uf ON uf.id = h.funcionario_id
        LEFT JOIN usuario ud ON ud.id = h.funcionario_destino_id
        WHERE h.solicitacao_id = ?
        ORDER BY h.data_hora ASC, h.id ASC
        """;

    // Só insere se o e-mail for de um cliente e a categoria existir e estiver ativa.
    private static final String INSERT_SOLICITACAO = """
        INSERT INTO solicitacao
            (cliente_id, categoria_id, descricao_equipamento, descricao_defeito, estado)
        SELECT cl.id, cat.id, ?, ?, 'ABERTA'
        FROM cliente cl
        JOIN usuario u ON u.id = cl.id
        JOIN categoria_equipamento cat ON cat.id = ? AND cat.ativo = TRUE
        WHERE cl.ativo = TRUE AND LOWER(u.email) = LOWER(?)
        RETURNING id
        """;

    private static final String INSERT_HISTORICO_ABERTURA = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo)
        SELECT id, data_hora_abertura, NULL, 'ABERTA'
        FROM solicitacao
        WHERE id = ?
        """;

    // Só altera se o estado ainda for o esperado; 0 linhas = outro usuário alterou antes (409).
    private static final String UPDATE_ESTADO = """
        UPDATE solicitacao
           SET estado = ?
         WHERE id = ? AND estado = ?
        """;

    private static final String INSERT_HISTORICO_CLIENTE = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, estado_anterior, estado_novo, valor, motivo)
        VALUES (?, ?, ?, ?, ?)
        """;

    private static final String SELECT_CLIENTE_DA_SOLICITACAO = """
        SELECT u.nome, c.cpf, u.email, c.telefone,
               e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado
        FROM solicitacao s
        JOIN cliente c ON c.id = s.cliente_id
        JOIN usuario u ON u.id = c.id
        JOIN endereco e ON e.id = c.endereco_id
        WHERE s.id = ?
        """;

    // RF012: só orça se ainda estiver ABERTA; se dois funcionários enviarem juntos, só um altera a linha.
    private static final String UPDATE_ORCAMENTO = """
        UPDATE solicitacao s
           SET estado = 'ORÇADA',
               valor_orcamento = ?,
               funcionario_orcamento_id = f.id,
               data_hora_orcamento = NOW()
          FROM funcionario f
          JOIN usuario u ON u.id = f.id
         WHERE LOWER(u.email) = LOWER(?) AND f.ativo = TRUE
           AND s.id = ? AND s.estado = 'ABERTA'
        """;

    // O valor vem da própria linha recém-orçada, para o histórico nunca divergir da solicitação.
    private static final String INSERT_HISTORICO_ORCAMENTO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo, funcionario_id, valor)
        SELECT s.id, s.data_hora_orcamento, 'ABERTA', 'ORÇADA', f.id, s.valor_orcamento
        FROM solicitacao s
        JOIN funcionario f ON f.id = s.funcionario_orcamento_id
        JOIN usuario u ON u.id = f.id
        WHERE s.id = ? AND s.estado = 'ORÇADA' AND LOWER(u.email) = LOWER(?)
        """;

    private static final String UPDATE_MANUTENCAO = """
        UPDATE solicitacao s
           SET estado = 'ARRUMADA'
          FROM funcionario f
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
           AND f.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
           AND s.estado = ?
        """;

    private static final String INSERT_HISTORICO_MANUTENCAO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, estado_anterior, estado_novo, funcionario_id,
             descricao_manutencao, orientacoes_cliente)
        SELECT s.id, ?, 'ARRUMADA', f.id, ?, ?
          FROM solicitacao s
          JOIN funcionario f ON f.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
          JOIN usuario u ON u.id = f.id
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND f.ativo = TRUE
           AND s.estado = 'ARRUMADA'
        """;

    private static final String UPDATE_REDIRECIONAMENTO = """
        UPDATE solicitacao s
           SET estado = 'REDIRECIONADA',
               funcionario_atual_id = destino.id
          FROM funcionario origem
          JOIN usuario u ON u.id = origem.id
          JOIN funcionario destino ON destino.id = ?
         WHERE s.id = ?
           AND LOWER(u.email) = LOWER(?)
           AND origem.ativo = TRUE
           AND destino.ativo = TRUE
           AND destino.id <> origem.id
           AND origem.id = COALESCE(s.funcionario_atual_id, s.funcionario_orcamento_id)
           AND s.estado = ?
        """;

    private static final String INSERT_HISTORICO_REDIRECIONAMENTO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, estado_anterior, estado_novo, funcionario_id, funcionario_destino_id)
        SELECT s.id, ?, 'REDIRECIONADA', origem.id, destino.id
          FROM solicitacao s
          JOIN funcionario origem ON origem.ativo = TRUE
          JOIN usuario u ON u.id = origem.id AND LOWER(u.email) = LOWER(?)
          JOIN funcionario destino ON destino.id = ?
         WHERE s.id = ?
           AND destino.ativo = TRUE
           AND s.estado = 'REDIRECIONADA'
           AND s.funcionario_atual_id = destino.id
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
    public Optional<SolicitacaoResumo> buscarVisivelAoFuncionario(Integer id, String emailFuncionario) {
        return jdbc.query(SELECT_UMA_VISIVEL, MAPPER, emailFuncionario, id)
            .stream()
            .findFirst();
    }

    @Override
    public List<SolicitacaoResumo> listarDoCliente(String emailCliente) {
        return jdbc.query(SELECT_DO_CLIENTE, MAPPER, emailCliente);
    }

    @Override
    public List<SolicitacaoAberta> listarAbertas() {
        return jdbc.query(SELECT_ABERTAS, (rs, rowNum) -> new SolicitacaoAberta(
            rs.getInt("id"),
            rs.getTimestamp("data_hora_abertura").toLocalDateTime(),
            rs.getString("cliente"),
            rs.getString("descricao_equipamento"),
            rs.getString("categoria_equipamento"),
            rs.getString("descricao_defeito")
        ));
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
    public int registrarAbertura(Integer solicitacaoId) {
        return jdbc.update(INSERT_HISTORICO_ABERTURA, solicitacaoId);
    }

    @Override
    public boolean alterarEstado(Integer id, String estadoAtual, String novoEstado) {
        return jdbc.update(UPDATE_ESTADO, novoEstado, id, estadoAtual) == 1;
    }

    @Override
    public Optional<ClienteDaSolicitacao> buscarClienteDaSolicitacao(Integer solicitacaoId) {
        return jdbc.query(SELECT_CLIENTE_DA_SOLICITACAO, (rs, rowNum) -> new ClienteDaSolicitacao(
            rs.getString("nome"),
            rs.getString("cpf"),
            rs.getString("email"),
            rs.getString("telefone"),
            rs.getString("cep"),
            rs.getString("logradouro"),
            rs.getString("numero"),
            rs.getString("complemento"),
            rs.getString("bairro"),
            rs.getString("cidade"),
            rs.getString("estado")
        ), solicitacaoId).stream().findFirst();
    }

    @Override
    public boolean orcar(Integer id, String emailFuncionario, BigDecimal valor) {
        return jdbc.update(UPDATE_ORCAMENTO, valor, emailFuncionario, id) == 1;
    }

    @Override
    public int registrarOrcamento(Integer solicitacaoId, String emailFuncionario) {
        return jdbc.update(INSERT_HISTORICO_ORCAMENTO, solicitacaoId, emailFuncionario);
    }

    @Override
    public boolean registrarManutencao(Integer id, String emailFuncionario, String estadoAnterior,
                                       String descricaoManutencao, String orientacoesCliente) {
        if (jdbc.update(UPDATE_MANUTENCAO, id, emailFuncionario, estadoAnterior) != 1) {
            return false;
        }
        return jdbc.update(INSERT_HISTORICO_MANUTENCAO, estadoAnterior, descricaoManutencao,
            orientacoesCliente, id, emailFuncionario) == 1;
    }

    @Override
    public boolean redirecionar(Integer id, String emailFuncionario, String estadoAnterior,
                                Integer funcionarioDestinoId) {
        if (jdbc.update(UPDATE_REDIRECIONAMENTO, funcionarioDestinoId, id, emailFuncionario,
                estadoAnterior) != 1) {
            return false;
        }
        return jdbc.update(INSERT_HISTORICO_REDIRECIONAMENTO, estadoAnterior, emailFuncionario,
            funcionarioDestinoId, id) == 1;
    }

    @Override
    public int registrarTransicaoDoCliente(Integer solicitacaoId, String estadoAnterior, String estadoNovo,
                                            BigDecimal valor, String motivo) {
        return jdbc.update(INSERT_HISTORICO_CLIENTE, solicitacaoId, estadoAnterior, estadoNovo, valor, motivo);
    }

    @Override
    public Optional<SolicitacaoResumo> buscarResumo(Integer id) {
        return jdbc.query(SELECT_RESUMO + " WHERE s.id = ?", MAPPER, id)
            .stream()
            .findFirst();
    }

    @Override
    public Optional<SolicitacaoResumo> buscarDoCliente(Integer id, String emailCliente) {
        return jdbc.query(SELECT_UMA_DO_CLIENTE, MAPPER, id, emailCliente)
            .stream()
            .findFirst();
    }

    @Override
    public List<HistoricoItem> listarHistorico(Integer solicitacaoId) {
        return jdbc.query(SELECT_HISTORICO, (rs, rowNum) -> new HistoricoItem(
            rs.getTimestamp("data_hora").toLocalDateTime(),
            rs.getString("estado_anterior"),
            rs.getString("estado_novo"),
            rs.getString("funcionario"),
            rs.getString("funcionario_destino"),
            rs.getBigDecimal("valor"),
            rs.getString("motivo"),
            rs.getString("descricao_manutencao"),
            rs.getString("orientacoes_cliente")
        ), solicitacaoId);
    }
}
