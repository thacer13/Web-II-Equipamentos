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

import br.ufpr.tads.webequipamentos.dao.ManutencaoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.ManutencaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.AcessoNegadoException;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;

class ManutencaoServiceTest {

    private final ManutencaoDao manutencaoDao = mock(ManutencaoDao.class);
    private final SolicitacaoDao solicitacaoDao = mock(SolicitacaoDao.class);
    private final ManutencaoService service = new ManutencaoService(manutencaoDao, solicitacaoDao);

    @Test
    void concluiSolicitacaoAprovadaERegistraHistorico() {
        ManutencaoRequest req = new ManutencaoRequest("  Troca   da tela  ", "  Evitar   quedas ");
        SolicitacaoResumo arrumada = new SolicitacaoResumo(
            7, LocalDateTime.of(2026, 11, 9, 15, 30), "Notebook", "Tela quebrada",
            "Notebook", "ARRUMADA", null
        );
        when(manutencaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("APROVADA"));
        when(manutencaoDao.concluir(7, "maria@teste.com", "APROVADA")).thenReturn(1);
        when(manutencaoDao.registrarHistorico(
            7, "maria@teste.com", "APROVADA", "Troca da tela", "Evitar quedas"
        )).thenReturn(1);
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(arrumada));

        assertEquals(arrumada, service.concluir(" maria@teste.com ", 7, req));
        verify(manutencaoDao).concluir(7, "maria@teste.com", "APROVADA");
        verify(manutencaoDao).registrarHistorico(
            7, "maria@teste.com", "APROVADA", "Troca da tela", "Evitar quedas"
        );
    }

    @Test
    void concluiSolicitacaoRedirecionada() {
        when(manutencaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("REDIRECIONADA"));
        when(manutencaoDao.concluir(7, "maria@teste.com", "REDIRECIONADA")).thenReturn(1);
        when(manutencaoDao.registrarHistorico(7, "maria@teste.com", "REDIRECIONADA",
            "Reparo feito", "Retirar amanhã")).thenReturn(1);
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(resumoArrumada()));

        assertEquals("ARRUMADA", service.concluir("maria@teste.com", 7,
            new ManutencaoRequest("Reparo feito", "Retirar amanhã")).estado());
        verify(manutencaoDao).registrarHistorico(7, "maria@teste.com", "REDIRECIONADA",
            "Reparo feito", "Retirar amanhã");
    }

    @Test
    void rejeitaSolicitacaoDeOutroFuncionario() {
        when(manutencaoDao.buscarEstadoDoFuncionario(7, "joao@teste.com"))
            .thenReturn(Optional.empty());
        when(solicitacaoDao.buscarResumo(7)).thenReturn(Optional.of(resumoArrumada()));

        assertThrows(AcessoNegadoException.class, () -> service.concluir(
            "joao@teste.com", 7, new ManutencaoRequest("Reparo feito", "Retirar amanhã")));
        verify(manutencaoDao, never()).concluir(anyInt(), anyString(), anyString());
    }

    @Test
    void retornaNaoEncontradoParaSolicitacaoInexistente() {
        when(manutencaoDao.buscarEstadoDoFuncionario(404, "maria@teste.com"))
            .thenReturn(Optional.empty());
        when(solicitacaoDao.buscarResumo(404)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.concluir(
            "maria@teste.com", 404, new ManutencaoRequest("Reparo feito", "Retirar amanhã")));
    }

    @Test
    void rejeitaEstadoQueNaoPermiteManutencao() {
        when(manutencaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("ARRUMADA"));

        assertThrows(ConflitoException.class, () -> service.concluir(
            "maria@teste.com", 7, new ManutencaoRequest("Reparo feito", "Retirar amanhã")));
        verify(manutencaoDao, never()).concluir(anyInt(), anyString(), anyString());
    }

    @Test
    void rejeitaConcorrenciaAntesDeGravarHistorico() {
        when(manutencaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("APROVADA"));
        when(manutencaoDao.concluir(7, "maria@teste.com", "APROVADA")).thenReturn(0);

        assertThrows(ConflitoException.class, () -> service.concluir(
            "maria@teste.com", 7, new ManutencaoRequest("Reparo feito", "Retirar amanhã")));
        verify(manutencaoDao, never()).registrarHistorico(
            anyInt(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void falhaSeHistoricoNaoForGravado() {
        when(manutencaoDao.buscarEstadoDoFuncionario(7, "maria@teste.com"))
            .thenReturn(Optional.of("APROVADA"));
        when(manutencaoDao.concluir(7, "maria@teste.com", "APROVADA")).thenReturn(1);
        when(manutencaoDao.registrarHistorico(7, "maria@teste.com", "APROVADA",
            "Reparo feito", "Retirar amanhã")).thenReturn(0);

        assertThrows(IllegalStateException.class, () -> service.concluir(
            "maria@teste.com", 7, new ManutencaoRequest("Reparo feito", "Retirar amanhã")));
    }

    @Test
    void validaCamposObrigatoriosAntesDoAcessoAoBanco() {
        assertThrows(IllegalArgumentException.class,
            () -> service.concluir("maria@teste.com", 7, new ManutencaoRequest("  ", "Orientação válida")));
        verifyNoInteractions(manutencaoDao, solicitacaoDao);
    }

    private SolicitacaoResumo resumoArrumada() {
        return new SolicitacaoResumo(
            7, LocalDateTime.of(2026, 11, 9, 15, 30), "Notebook", "Tela quebrada",
            "Notebook", "ARRUMADA", null
        );
    }
}
