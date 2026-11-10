package br.ufpr.tads.webequipamentos.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import br.ufpr.tads.webequipamentos.dao.FinalizacaoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;

class FinalizacaoServiceTest {

    private final FinalizacaoDao finalizacaoDao = mock(FinalizacaoDao.class);
    private final SolicitacaoDao solicitacaoDao = mock(SolicitacaoDao.class);
    private final FinalizacaoService service = new FinalizacaoService(finalizacaoDao, solicitacaoDao);

    private SolicitacaoResumo resumo(String estado) {
        return new SolicitacaoResumo(7, LocalDateTime.of(2026, 11, 9, 15, 30),
            "Notebook", "Tela com defeito", "Notebook", estado, new BigDecimal("250.00"));
    }

    @Test
    void finalizaServicoPago() {
        when(finalizacaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("PAGA"));
        when(finalizacaoDao.finalizar(7, "maria@teste.com")).thenReturn(1);
        when(finalizacaoDao.registrarFinalizacao(7, "maria@teste.com")).thenReturn(1);
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(resumo("FINALIZADA")));

        assertEquals("FINALIZADA", service.finalizar(" maria@teste.com ", 7).estado());
        verify(finalizacaoDao).finalizar(7, "maria@teste.com");
        verify(finalizacaoDao).registrarFinalizacao(7, "maria@teste.com");
    }

    @Test
    void impedeFinalizacaoDuplicada() {
        when(finalizacaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("FINALIZADA"));

        assertThrows(ConflitoException.class, () -> service.finalizar("maria@teste.com", 7));
        verify(finalizacaoDao, never()).finalizar(anyInt(), anyString());
    }

    @Test
    void impedeFinalizacaoSemPagamento() {
        when(finalizacaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("ARRUMADA"));

        assertThrows(ConflitoException.class, () -> service.finalizar("maria@teste.com", 7));
        verify(finalizacaoDao, never()).finalizar(anyInt(), anyString());
    }

    @Test
    void impedeAcessoDeOutroFuncionario() {
        when(finalizacaoDao.buscarEstadoDoFuncionario(7, "joao@teste.com"))
            .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.finalizar("joao@teste.com", 7));
        verify(finalizacaoDao, never()).finalizar(anyInt(), anyString());
    }

    @Test
    void rejeitaTentativaConcorrente() {
        when(finalizacaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("PAGA"));
        when(finalizacaoDao.finalizar(7, "maria@teste.com")).thenReturn(0);

        assertThrows(ConflitoException.class, () -> service.finalizar("maria@teste.com", 7));
        verify(finalizacaoDao, never()).registrarFinalizacao(anyInt(), anyString());
    }

    @Test
    void falhaAoRegistrarHistorico() {
        when(finalizacaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("PAGA"));
        when(finalizacaoDao.finalizar(7, "maria@teste.com")).thenReturn(1);
        when(finalizacaoDao.registrarFinalizacao(7, "maria@teste.com")).thenReturn(0);

        assertThrows(IllegalStateException.class, () -> service.finalizar("maria@teste.com", 7));
    }

    @Test
    void rejeitaEmailVazio() {
        assertThrows(IllegalArgumentException.class, () -> service.finalizar(" ", 7));
        verifyNoInteractions(finalizacaoDao);
    }
}