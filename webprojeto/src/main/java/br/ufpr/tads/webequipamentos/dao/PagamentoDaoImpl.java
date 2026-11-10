package br.ufpr.tads.webequipamentos.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PagamentoDaoImpl implements PagamentoDao {

    private final JdbcTemplate jdbc;

    public PagamentoDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String CONFIRMAR_PAGAMENTO = """
        UPDATE solicitacao s
           SET estado = 'PAGA',
               data_hora_pagamento = NOW()
          FROM cliente c
          JOIN usuario u ON u.id = c.id
         WHERE s.id = ?
           AND s.cliente_id = c.id
           AND LOWER(u.email) = LOWER(?)
           AND s.estado = 'ARRUMADA'
           AND s.data_hora_pagamento IS NULL
           AND s.valor_orcamento > 0
        """;

    private static final String REGISTRAR_HISTORICO = """
        INSERT INTO historico_solicitacao
            (solicitacao_id, data_hora, estado_anterior, estado_novo, valor)
        SELECT s.id, s.data_hora_pagamento, 'ARRUMADA', 'PAGA', s.valor_orcamento
          FROM solicitacao s
         WHERE s.id = ?
           AND s.estado = 'PAGA'
           AND s.data_hora_pagamento IS NOT NULL
        """;

    @Override
    public int confirmarPagamento(Integer solicitacaoId, String emailCliente) {
        return jdbc.update(CONFIRMAR_PAGAMENTO, solicitacaoId, emailCliente);
    }

    @Override
    public int registrarPagamento(Integer solicitacaoId) {
        return jdbc.update(REGISTRAR_HISTORICO, solicitacaoId);
    }
}