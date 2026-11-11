package br.ufpr.tads.webequipamentos.services;

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

import br.ufpr.tads.webequipamentos.dao.RedirecionamentoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.RedirecionamentoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.AcessoNegadoException;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;

class RedirecionamentoServiceTest {

    private final RedirecionamentoDao redirecionamentoDao = mock(RedirecionamentoDao.class);
    private final SolicitacaoDao solicitacaoDao = mock(SolicitacaoDao.class);
    private final RedirecionamentoService service = new RedirecionamentoService(redirecionamentoDao, solicitacaoDao);

    @Test
    void redirecionaSolicitacaoAprovadaERegistraHistorico() {
        RedirecionamentoRequest req = new RedirecionamentoRequest(2);
        SolicitacaoResumo redirecionada = new SolicitacaoResumo(
            7, LocalDateTime.of(2026, 11, 9, 15, 30), "Notebook", "Tela quebrada",
            "Notebook", "REDIRECIONADA", null
        );

        when(redirecionamentoDao.buscarOrigem(7, "maria@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("APROVADA", 1)));
        when(redirecionamentoDao.funcionarioAtivo(2)).thenReturn(true);
        when(redirecionamentoDao.redirecionar(7, 2, "APROVADA")).thenReturn(1);
        when(redirecionamentoDao.registrarHistorico(7, 1, 2, "APROVADA")).thenReturn(1);
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(redirecionada));

        assertEquals(redirecionada, service.redirecionar(" maria@teste.com ", 7, req));
        verify(redirecionamentoDao).redirecionar(7, 2, "APROVADA");
        verify(redirecionamentoDao).registrarHistorico(7, 1, 2, "APROVADA");
    }

    @Test
    void redirecionaSolicitacaoRedirecionadaSucessivamente() {
        RedirecionamentoRequest req = new RedirecionamentoRequest(3);
        when(redirecionamentoDao.buscarOrigem(7, "mario@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("REDIRECIONADA", 2)));
        when(redirecionamentoDao.funcionarioAtivo(3)).thenReturn(true);
        when(redirecionamentoDao.redirecionar(7, 3, "REDIRECIONADA")).thenReturn(1);
        when(redirecionamentoDao.registrarHistorico(7, 2, 3, "REDIRECIONADA")).thenReturn(1);
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(resumoRedirecionada()));

        assertEquals("REDIRECIONADA", service.redirecionar("mario@teste.com", 7, req).estado());
        verify(redirecionamentoDao).registrarHistorico(7, 2, 3, "REDIRECIONADA");
    }

    @Test
    void rejeitaAutoRedirecionamento() {
        RedirecionamentoRequest req = new RedirecionamentoRequest(1);
        when(redirecionamentoDao.buscarOrigem(7, "maria@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("APROVADA", 1)));

        assertThrows(IllegalArgumentException.class, () -> service.redirecionar("maria@teste.com", 7, req));
        verify(redirecionamentoDao, never()).redirecionar(anyInt(), anyInt(), anyString());
    }

    @Test
    void rejeitaFuncionarioDestinoInativoOuInexistente() {
        RedirecionamentoRequest req = new RedirecionamentoRequest(99);
        when(redirecionamentoDao.buscarOrigem(7, "maria@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("APROVADA", 1)));
        when(redirecionamentoDao.funcionarioAtivo(99)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.redirecionar("maria@teste.com", 7, req));
        verify(redirecionamentoDao, never()).redirecionar(anyInt(), anyInt(), anyString());
    }

    @Test
    void rejeitaSolicitacaoDeOutroFuncionario() {
        when(redirecionamentoDao.buscarOrigem(7, "joao@teste.com"))
            .thenReturn(Optional.empty());
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(resumoRedirecionada()));

        assertThrows(AcessoNegadoException.class, () -> service.redirecionar(
            "joao@teste.com", 7, new RedirecionamentoRequest(2)));
        verify(redirecionamentoDao, never()).redirecionar(anyInt(), anyInt(), anyString());
    }

    @Test
    void retornaNaoEncontradoParaSolicitacaoInexistente() {
        when(redirecionamentoDao.buscarOrigem(404, "maria@teste.com"))
            .thenReturn(Optional.empty());
        when(solicitacaoDao.buscarResumo(404)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.redirecionar(
            "maria@teste.com", 404, new RedirecionamentoRequest(2)));
    }

    @Test
    void rejeitaEstadoQueNaoPermiteRedirecionamento() {
        when(redirecionamentoDao.buscarOrigem(7, "maria@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("ARRUMADA", 1)));
        when(redirecionamentoDao.funcionarioAtivo(2)).thenReturn(true);

        assertThrows(ConflitoException.class, () -> service.redirecionar(
            "maria@teste.com", 7, new RedirecionamentoRequest(2)));
        verify(redirecionamentoDao, never()).redirecionar(anyInt(), anyInt(), anyString());
    }

    @Test
    void rejeitaConcorrenciaAntesDeGravarHistorico() {
        when(redirecionamentoDao.buscarOrigem(7, "maria@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("APROVADA", 1)));
        when(redirecionamentoDao.funcionarioAtivo(2)).thenReturn(true);
        when(redirecionamentoDao.redirecionar(7, 2, "APROVADA")).thenReturn(0);

        assertThrows(ConflitoException.class, () -> service.redirecionar(
            "maria@teste.com", 7, new RedirecionamentoRequest(2)));
        verify(redirecionamentoDao, never()).registrarHistorico(anyInt(), anyInt(), anyInt(), anyString());
    }

    @Test
    void falhaSeHistoricoNaoForGravado() {
        when(redirecionamentoDao.buscarOrigem(7, "maria@teste.com"))
            .thenReturn(Optional.of(new RedirecionamentoDao.OrigemSolicitacao("APROVADA", 1)));
        when(redirecionamentoDao.funcionarioAtivo(2)).thenReturn(true);
        when(redirecionamentoDao.redirecionar(7, 2, "APROVADA")).thenReturn(1);
        when(redirecionamentoDao.registrarHistorico(7, 1, 2, "APROVADA")).thenReturn(0);

        assertThrows(IllegalStateException.class, () -> service.redirecionar(
            "maria@teste.com", 7, new RedirecionamentoRequest(2)));
    }

    @Test
    void validaCamposObrigatorios() {
        assertThrows(IllegalArgumentException.class,
            () -> service.redirecionar("maria@teste.com", 7, null));
        assertThrows(IllegalArgumentException.class,
            () -> service.redirecionar("maria@teste.com", 7, new RedirecionamentoRequest(null)));
        assertThrows(IllegalArgumentException.class,
            () -> service.redirecionar("maria@teste.com", 7, new RedirecionamentoRequest(-1)));
        assertThrows(IllegalArgumentException.class,
            () -> service.redirecionar(null, 7, new RedirecionamentoRequest(2)));
        assertThrows(IllegalArgumentException.class,
            () -> service.redirecionar("maria@teste.com", null, new RedirecionamentoRequest(2)));
        verifyNoInteractions(redirecionamentoDao, solicitacaoDao);
    }

    private SolicitacaoResumo resumoRedirecionada() {
        return new SolicitacaoResumo(
            7, LocalDateTime.of(2026, 11, 9, 15, 30), "Notebook", "Tela quebrada",
            "Notebook", "REDIRECIONADA", null
        );
    }
}
