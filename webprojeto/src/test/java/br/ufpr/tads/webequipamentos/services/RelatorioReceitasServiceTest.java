package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.RelatorioReceitasDao;
import br.ufpr.tads.webequipamentos.dto.ReceitaDia;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class RelatorioReceitasServiceTest {

    private final RelatorioReceitasDao dao = mock(RelatorioReceitasDao.class);
    private final RelatorioReceitasService service = new RelatorioReceitasService(dao);

    @Test
    void retornaTotaisAgrupadosPeloDao() {
        LocalDate inicio = LocalDate.of(2026, 11, 1);
        LocalDate fim = LocalDate.of(2026, 11, 30);
        List<ReceitaDia> esperado = List.of(
            new ReceitaDia(LocalDate.of(2026, 11, 4), 2, new BigDecimal("300.00")),
            new ReceitaDia(LocalDate.of(2026, 11, 9), 1, new BigDecimal("125.50"))
        );
        when(dao.listarPorPeriodo(inicio, fim)).thenReturn(esperado);

        assertEquals(esperado, service.listar(inicio, fim));
    }

    @Test
    void permiteFiltrosOpcionais() {
        service.listar(null, LocalDate.of(2026, 11, 30));

        verify(dao).listarPorPeriodo(null, LocalDate.of(2026, 11, 30));
    }

    @Test
    void rejeitaPeriodoInvertidoAntesDeConsultarBanco() {
        assertThrows(
            IllegalArgumentException.class,
            () -> service.listar(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 11, 30))
        );

        verifyNoInteractions(dao);
    }
}
