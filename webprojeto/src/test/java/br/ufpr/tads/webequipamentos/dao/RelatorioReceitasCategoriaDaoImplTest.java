package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ReceitaCategoria;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RelatorioReceitasCategoriaDaoImplTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final RelatorioReceitasCategoriaDaoImpl dao =
        new RelatorioReceitasCategoriaDaoImpl(jdbc);

    @Test
    @SuppressWarnings("unchecked")
    void retornaValoresAgrupadosPorCategoriaSomenteParaPagamentosEfetivos() {
        var receitas = java.util.List.of(new ReceitaCategoria(
            "Notebook",
            2,
            new java.math.BigDecimal("450.00")
        ));
        when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(receitas);

        assertEquals(receitas, dao.listar());

        var sql = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(jdbc).query(sql.capture(), any(RowMapper.class));
        assertTrue(sql.getValue().contains("JOIN categoria_equipamento c ON c.id = s.categoria_id"));
        assertTrue(sql.getValue().contains("s.data_hora_pagamento IS NOT NULL"));
        assertTrue(sql.getValue().contains("s.valor_orcamento > 0"));
        assertTrue(sql.getValue().contains("COUNT(*) AS quantidade"));
        assertTrue(sql.getValue().contains("SUM(s.valor_orcamento) AS receita"));
        assertTrue(sql.getValue().contains("GROUP BY c.id, c.nome"));
        assertTrue(sql.getValue().contains("ORDER BY c.nome"));
    }
}
