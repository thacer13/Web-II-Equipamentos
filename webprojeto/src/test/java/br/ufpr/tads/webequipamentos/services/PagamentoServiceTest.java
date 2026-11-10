package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.PagamentoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PagamentoServiceTest {

    private final PagamentoDao pagamentoDao = mock(PagamentoDao.class);
    private final SolicitacaoDao solicitacaoDao = mock(SolicitacaoDao.class);
    private final PagamentoService service = new PagamentoService(
        pagamentoDao,
        solicitacaoDao
    );

    private SolicitacaoResumo resumo(String estado, BigDecimal valor) {
        return new SolicitacaoResumo(
            7,
            LocalDateTime.of(2026, 11, 9, 15, 30),
            "Notebook",
            "Tela com defeito",
            "Notebook",
            estado,
            valor
        );
    }

    @Test
    void pagaSomenteArrumadaDoClienteERegistraHistorico() {
        when(solicitacaoDao.buscarDoCliente(7, "joao@teste.com"))
            .thenReturn(
                Optional.of(resumo("ARRUMADA", new BigDecimal("250.00")))
            )
            .thenReturn(
                Optional.of(resumo("PAGA", new BigDecimal("250.00")))
            );

        when(pagamentoDao.confirmarPagamento(7, "joao@teste.com"))
            .thenReturn(1);

        when(pagamentoDao.registrarPagamento(7))
            .thenReturn(1);

        assertEquals(
            "PAGA",
            service.pagar(" joao@teste.com ", 7).estado()
        );

        verify(pagamentoDao)
            .confirmarPagamento(7, "joao@teste.com");

        verify(pagamentoDao)
            .registrarPagamento(7);
    }

    @Test
    void pagamentoRepetidoNaoAlteraBanco() {
        when(solicitacaoDao.buscarDoCliente(7, "joao@teste.com"))
            .thenReturn(
                Optional.of(resumo("PAGA", new BigDecimal("250.00")))
            );

        assertThrows(
            ConflitoException.class,
            () -> service.pagar("joao@teste.com", 7)
        );

        verifyNoInteractions(pagamentoDao);
    }

    @Test
    void naoPermitePagamentoPorOutroCliente() {
        when(solicitacaoDao.buscarDoCliente(7, "jose@teste.com"))
            .thenReturn(Optional.empty());

        assertThrows(
            NaoEncontradoException.class,
            () -> service.pagar("jose@teste.com", 7)
        );

        verifyNoInteractions(pagamentoDao);
    }

    @Test
    void naoPermitePagamentoAntesDaManutencao() {
        when(solicitacaoDao.buscarDoCliente(7, "joao@teste.com"))
            .thenReturn(
                Optional.of(resumo("APROVADA", new BigDecimal("250.00")))
            );

        assertThrows(
            ConflitoException.class,
            () -> service.pagar("joao@teste.com", 7)
        );

        verifyNoInteractions(pagamentoDao);
    }

    @Test
    void naoPermiteValorAusente() {
        when(solicitacaoDao.buscarDoCliente(7, "joao@teste.com"))
            .thenReturn(Optional.of(resumo("ARRUMADA", null)));

        assertThrows(
            ConflitoException.class,
            () -> service.pagar("joao@teste.com", 7)
        );

        verifyNoInteractions(pagamentoDao);
    }

    @Test
    void rejeitaTentativaConcorrente() {
        when(solicitacaoDao.buscarDoCliente(7, "joao@teste.com"))
            .thenReturn(
                Optional.of(resumo("ARRUMADA", new BigDecimal("250.00")))
            );

        when(pagamentoDao.confirmarPagamento(7, "joao@teste.com"))
            .thenReturn(0);

        assertThrows(
            ConflitoException.class,
            () -> service.pagar("joao@teste.com", 7)
        );

        verify(pagamentoDao, never())
            .registrarPagamento(7);
    }

    @Test
    void falhaHistoricoFazTransacaoFalhar() {
        when(solicitacaoDao.buscarDoCliente(7, "joao@teste.com"))
            .thenReturn(
                Optional.of(resumo("ARRUMADA", new BigDecimal("250.00")))
            );

        when(pagamentoDao.confirmarPagamento(7, "joao@teste.com"))
            .thenReturn(1);

        when(pagamentoDao.registrarPagamento(7))
            .thenReturn(0);

        assertThrows(
            IllegalStateException.class,
            () -> service.pagar("joao@teste.com", 7)
        );
    }
}