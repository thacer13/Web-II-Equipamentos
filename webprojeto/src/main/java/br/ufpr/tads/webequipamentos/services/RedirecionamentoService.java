package br.ufpr.tads.webequipamentos.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufpr.tads.webequipamentos.dao.RedirecionamentoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.RedirecionamentoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.AcessoNegadoException;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.EstadoSolicitacao;

@Service
public class RedirecionamentoService {

    private final RedirecionamentoDao redirecionamentoDao;
    private final SolicitacaoDao solicitacaoDao;

    public RedirecionamentoService(RedirecionamentoDao redirecionamentoDao, SolicitacaoDao solicitacaoDao) {
        this.redirecionamentoDao = redirecionamentoDao;
        this.solicitacaoDao = solicitacaoDao;
    }

    @Transactional
    public SolicitacaoResumo redirecionar(String emailFuncionario, Integer solicitacaoId, RedirecionamentoRequest req) {
        if (emailFuncionario == null || emailFuncionario.isBlank()) {
            throw new IllegalArgumentException("Funcionário não identificado.");
        }
        if (solicitacaoId == null || solicitacaoId <= 0) {
            throw new IllegalArgumentException("Solicitação inválida.");
        }
        if (req == null || req.funcionarioDestinoId() == null || req.funcionarioDestinoId() <= 0) {
            throw new IllegalArgumentException("Funcionário de destino inválido.");
        }

        String email = emailFuncionario.trim();
        RedirecionamentoDao.OrigemSolicitacao origem = redirecionamentoDao.buscarOrigem(solicitacaoId, email)
            .orElseGet(() -> {
                solicitacaoDao.buscarResumo(solicitacaoId).orElseThrow(NaoEncontradoException::new);
                throw new AcessoNegadoException("Funcionário não é responsável por esta solicitação.");
            });

        if (origem.funcionarioOrigemId() == req.funcionarioDestinoId()) {
            throw new IllegalArgumentException("Não é permitido redirecionar a solicitação para si mesmo.");
        }

        if (!redirecionamentoDao.funcionarioAtivo(req.funcionarioDestinoId())) {
            throw new IllegalArgumentException("Funcionário de destino inexistente ou inativo.");
        }

        EstadoSolicitacao estadoAtual = EstadoSolicitacao.doBanco(origem.estado());
        estadoAtual.validarTransicao(EstadoSolicitacao.REDIRECIONADA);

        if (redirecionamentoDao.redirecionar(solicitacaoId, req.funcionarioDestinoId(), estadoAtual.valorBanco()) != 1) {
            throw new ConflitoException("A solicitação foi alterada ou não está mais atribuída a você.");
        }

        if (redirecionamentoDao.registrarHistorico(
                solicitacaoId, origem.funcionarioOrigemId(), req.funcionarioDestinoId(), estadoAtual.valorBanco()) != 1) {
            throw new IllegalStateException("Não foi possível registrar o histórico do redirecionamento.");
        }

        return solicitacaoDao.buscarResumo(solicitacaoId).orElseThrow(NaoEncontradoException::new);
    }
}
