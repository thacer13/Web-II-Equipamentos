package br.ufpr.tads.webequipamentos.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufpr.tads.webequipamentos.dao.FinalizacaoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.EstadoSolicitacao;

@Service
public class FinalizacaoService {

    private final FinalizacaoDao finalizacaoDao;
    private final SolicitacaoDao solicitacaoDao;

    public FinalizacaoService(FinalizacaoDao finalizacaoDao, SolicitacaoDao solicitacaoDao) {
        this.finalizacaoDao = finalizacaoDao;
        this.solicitacaoDao = solicitacaoDao;
    }

    @Transactional
    public SolicitacaoResumo finalizar(String emailFuncionario, Integer solicitacaoId) {
        if (emailFuncionario == null || emailFuncionario.isBlank()) {
            throw new IllegalArgumentException("Funcionário não identificado.");
        }
        if (solicitacaoId == null || solicitacaoId <= 0) {
            throw new IllegalArgumentException("Solicitação inválida.");
        }

        String email = emailFuncionario.trim();

        String estado = finalizacaoDao.buscarEstadoDoFuncionario(solicitacaoId, email)
            .orElseThrow(NaoEncontradoException::new);

        EstadoSolicitacao.doBanco(estado).validarTransicao(EstadoSolicitacao.FINALIZADA);

        if (finalizacaoDao.finalizar(solicitacaoId, email) != 1) {
            throw new ConflitoException("A solicitação não está disponível para finalização.");
        }

        if (finalizacaoDao.registrarFinalizacao(solicitacaoId, email) != 1) {
            throw new IllegalStateException("Não foi possível registrar o histórico da finalização.");
        }

        return solicitacaoDao.buscarResumo(solicitacaoId)
            .orElseThrow(NaoEncontradoException::new);
    }
}