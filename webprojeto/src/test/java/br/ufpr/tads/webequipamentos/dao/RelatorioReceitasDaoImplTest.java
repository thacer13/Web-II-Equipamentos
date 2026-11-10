package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ReceitaDia;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RelatorioReceitasDaoImplTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final RelatorioReceitasDaoImpl dao = new RelatorioReceitasDaoImpl(jdbc);

    @Test
    @SuppressWarnings("unchecked")
    void agrupaPagamentosPorDiaEUsaLimitesInclusivos() {
        LocalDate inicio = LocalDate.of(2026, 11, 1);
        LocalDate fim = LocalDate.of(2026, 11, 30);
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class)))
            .thenReturn(java.util.List.of());

        assertEquals(java.util.List.of(), dao.listarPorPeriodo(inicio, fim));

        var sql = org.mockito.ArgumentCaptor.forClass(String.class);
        var parametros = org.mockito.ArgumentCaptor.forClass(Object[].class);
        verify(jdbc).query(sql.capture(), any(RowMapper.class), parametros.capture());
        assertArrayEquals(
            new Object[] { inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay() },
            parametros.getValue()
        );
        org.junit.jupiter.api.Assertions.assertTrue(sql.getValue().contains("CAST(data_hora_pagamento AS DATE)"));
        org.junit.jupiter.api.Assertions.assertTrue(sql.getValue().contains("data_hora_pagamento IS NOT NULL"));
        org.junit.jupiter.api.Assertions.assertTrue(sql.getValue().contains("SUM(valor_orcamento)"));
        org.junit.jupiter.api.Assertions.assertTrue(sql.getValue().contains("GROUP BY CAST(data_hora_pagamento AS DATE)"));
        org.junit.jupiter.api.Assertions.assertFalse(sql.getValue().contains("estado = 'PAGA'"));
    }
}
