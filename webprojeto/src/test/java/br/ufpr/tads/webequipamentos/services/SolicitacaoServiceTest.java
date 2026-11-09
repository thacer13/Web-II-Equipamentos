package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.HistoricoItem;
import br.ufpr.tads.webequipamentos.dto.NovaSolicitacaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoDetalhe;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

class SolicitacaoServiceTest {

    private final SolicitacaoDao dao = mock(SolicitacaoDao.class);

    private final SolicitacaoService service = new SolicitacaoService(dao);

    @Test
    void criaSolicitacaoNormalizadaComHistorico() {

        NovaSolicitacaoRequest req = new NovaSolicitacaoRequest(
            "  Notebook   Dell ", 2, " Tela  piscando sem parar "
        );

        SolicitacaoResumo criada = new SolicitacaoResumo(
            7, LocalDateTime.of(2026, 11, 9, 19, 0),
            "Notebook Dell", "Tela piscando sem parar",
            "Notebook", "ABERTA", null
        );

        when(dao.inserir("joao@teste.com", 2, "Notebook Dell", "Tela piscando sem parar"))
            .thenReturn(Optional.of(7));
        when(dao.buscarResumo(7)).thenReturn(Optional.of(criada));

        assertEquals(criada, service.criar(" joao@teste.com ", req));

        verify(dao).registrarAbertura(7);
    }

    @Test
    void detalheIncluiHistoricoDaSolicitacao() {

        SolicitacaoResumo resumo = new SolicitacaoResumo(
            7, LocalDateTime.of(2026, 11, 9, 19, 0),
            "Notebook", "Tela piscando sem parar",
            "Notebook", "ORÇADA", new BigDecimal("250.00")
        );

        List<HistoricoItem> historico = List.of(
            new HistoricoItem(LocalDateTime.of(2026, 11, 9, 19, 0),
                null, "ABERTA", null, null, null, null, null, null),
            new HistoricoItem(LocalDateTime.of(2026, 11, 10, 9, 0),
                "ABERTA", "ORÇADA", "Maria", null, new BigDecimal("250.00"), null, null, null)
        );

        when(dao.buscarDoCliente(7, "joao@teste.com")).thenReturn(Optional.of(resumo));
        when(dao.listarHistorico(7)).thenReturn(historico);

        SolicitacaoDetalhe detalhe = service.detalharDoCliente("joao@teste.com", 7);

        assertEquals("ORÇADA", detalhe.estado());
        assertEquals(historico, detalhe.historico());
    }

    @Test
    void detalheDeOutroClienteNaoEncontrado() {

        when(dao.buscarDoCliente(7, "jose@teste.com")).thenReturn(Optional.empty());

        assertThrows(
            NaoEncontradoException.class,
            () -> service.detalharDoCliente("jose@teste.com", 7)
        );

        verify(dao, never()).listarHistorico(any());
    }

    @Test
    void rejeitaDefeitoCurto() {

        NovaSolicitacaoRequest req = new NovaSolicitacaoRequest(
            "Notebook", 2, "curto"
        );

        assertThrows(
            IllegalArgumentException.class,
            () -> service.criar("joao@teste.com", req)
        );

        verifyNoInteractions(dao);
    }

    @Test
    void rejeitaSemCategoria() {

        NovaSolicitacaoRequest req = new NovaSolicitacaoRequest(
            "Notebook", null, "Tela piscando sem parar"
        );

        assertThrows(
            IllegalArgumentException.class,
            () -> service.criar("joao@teste.com", req)
        );

        verifyNoInteractions(dao);
    }

    @Test
    void naoRegistraHistoricoQuandoCategoriaInvalida() {

        NovaSolicitacaoRequest req = new NovaSolicitacaoRequest(
            "Notebook", 99, "Tela piscando sem parar"
        );

        when(dao.inserir("joao@teste.com", 99, "Notebook", "Tela piscando sem parar"))
            .thenReturn(Optional.empty());

        assertThrows(
            IllegalArgumentException.class,
            () -> service.criar("joao@teste.com", req)
        );

        verify(dao, never()).registrarAbertura(any());
    }
}
