package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ReceitaDia;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class RelatorioReceitasDaoImpl implements RelatorioReceitasDao {

    private static final String SELECT_RECEITAS = """
        SELECT CAST(data_hora_pagamento AS DATE) AS data,
               COUNT(*) AS quantidade,
               SUM(valor_orcamento) AS receita
          FROM solicitacao
         WHERE data_hora_pagamento IS NOT NULL
           AND valor_orcamento > 0
        """;

    private final JdbcTemplate jdbc;

    public RelatorioReceitasDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<ReceitaDia> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        StringBuilder sql = new StringBuilder(SELECT_RECEITAS);
        List<Object> parametros = new ArrayList<>();

        if (inicio != null) {
            sql.append(" AND data_hora_pagamento >= ?");
            parametros.add(inicio.atStartOfDay());
        }
        if (fim != null) {
            sql.append(" AND data_hora_pagamento < ?");
            parametros.add(fim.plusDays(1).atStartOfDay());
        }

        sql.append(" GROUP BY CAST(data_hora_pagamento AS DATE) ORDER BY data");

        return jdbc.query(sql.toString(), (rs, rowNum) -> new ReceitaDia(
            rs.getObject("data", LocalDate.class),
            rs.getLong("quantidade"),
            rs.getBigDecimal("receita")
        ), parametros.toArray());
    }
}
