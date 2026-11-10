package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ReceitaCategoria;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RelatorioReceitasCategoriaDaoImpl implements RelatorioReceitasCategoriaDao {

    private static final String SELECT_RECEITAS_POR_CATEGORIA = """
        SELECT c.nome AS categoria,
               COUNT(*) AS quantidade,
               SUM(s.valor_orcamento) AS receita
          FROM solicitacao s
          JOIN categoria_equipamento c ON c.id = s.categoria_id
         WHERE s.data_hora_pagamento IS NOT NULL
           AND s.valor_orcamento > 0
         GROUP BY c.id, c.nome
         ORDER BY c.nome
        """;

    private final JdbcTemplate jdbc;

    public RelatorioReceitasCategoriaDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<ReceitaCategoria> listar() {
        return jdbc.query(SELECT_RECEITAS_POR_CATEGORIA, (rs, rowNum) -> new ReceitaCategoria(
            rs.getString("categoria"),
            rs.getLong("quantidade"),
            rs.getBigDecimal("receita")
        ));
    }
}
