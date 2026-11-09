package br.ufpr.tads.webequipamentos.model;

import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import org.junit.jupiter.api.Test;

import static br.ufpr.tads.webequipamentos.model.EstadoSolicitacao.*;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EstadoSolicitacaoTest {

    @Test
    void fluxoPrincipalEhPermitido() {
        assertTrue(ABERTA.podeIrPara(ORCADA));
        assertTrue(ORCADA.podeIrPara(APROVADA));
        assertTrue(APROVADA.podeIrPara(ARRUMADA));
        assertTrue(ARRUMADA.podeIrPara(PAGA));
        assertTrue(PAGA.podeIrPara(FINALIZADA));
    }

    @Test
    void transicoesAlternativasSaoPermitidas() {
        assertTrue(ORCADA.podeIrPara(REJEITADA));
        assertTrue(REJEITADA.podeIrPara(APROVADA));
        assertTrue(APROVADA.podeIrPara(REDIRECIONADA));
        assertTrue(REDIRECIONADA.podeIrPara(REDIRECIONADA));
        assertTrue(REDIRECIONADA.podeIrPara(ARRUMADA));
    }

    @Test
    void naoPulaEtapas() {
        assertFalse(ABERTA.podeIrPara(APROVADA));
        assertFalse(ORCADA.podeIrPara(ARRUMADA));
        assertFalse(APROVADA.podeIrPara(PAGA));
        assertFalse(ARRUMADA.podeIrPara(FINALIZADA));
        assertFalse(REJEITADA.podeIrPara(ORCADA));
    }

    @Test
    void finalizadaEhEstadoTerminal() {
        assertTrue(FINALIZADA.proximos().isEmpty());
    }

    @Test
    void transicaoInvalidaLancaConflito() {
        assertDoesNotThrow(() -> ABERTA.validarTransicao(ORCADA));
        assertThrows(ConflitoException.class, () -> PAGA.validarTransicao(ARRUMADA));
    }

    @Test
    void converteValorDoBancoComCedilha() {
        assertEquals(ORCADA, doBanco("ORÇADA"));
        assertEquals("ORÇADA", ORCADA.valorBanco());
        assertThrows(IllegalArgumentException.class, () -> doBanco("ORCADA"));
    }
}
