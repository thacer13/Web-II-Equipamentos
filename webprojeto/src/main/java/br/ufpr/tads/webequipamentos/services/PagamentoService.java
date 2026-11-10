package br.ufpr.tads.webequipamentos.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufpr.tads.webequipamentos.dao.PagamentoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.EstadoSolicitacao;

@Service
public class PagamentoService {

    private final PagamentoDao pagamentoDao;
    private final SolicitacaoDao solicitacaoDao;

    public PagamentoService(
        PagamentoDao pagamentoDao,
        SolicitacaoDao solicitacaoDao
    ) {
        this.pagamentoDao = pagamentoDao;
        this.solicitacaoDao = solicitacaoDao;
    }

    @Transactional
    public SolicitacaoResumo pagar(
        String emailCliente,
        Integer solicitacaoId
    ) {
        if (emailCliente == null || emailCliente.isBlank()) {
            throw new IllegalArgumentException("Cliente não identificado.");
        }

        String email = emailCliente.trim();

        SolicitacaoResumo atual =
            solicitacaoDao.buscarDoCliente(solicitacaoId, email)
                .orElseThrow(NaoEncontradoException::new);

        EstadoSolicitacao.doBanco(atual.estado())
            .validarTransicao(EstadoSolicitacao.PAGA);

        if (
            atual.precoOrcado() == null ||
            atual.precoOrcado().signum() <= 0
        ) {
            throw new ConflitoException(
                "A solicitação não possui um orçamento válido para pagamento."
            );
        }

        if (pagamentoDao.confirmarPagamento(solicitacaoId, email) != 1) {
            throw new ConflitoException(
                "O pagamento não foi realizado. Atualize a solicitação."
            );
        }

        if (pagamentoDao.registrarPagamento(solicitacaoId) != 1) {
            throw new IllegalStateException(
                "Não foi possível registrar o histórico do pagamento."
            );
        }

        return solicitacaoDao.buscarDoCliente(solicitacaoId, email)
            .orElseThrow(NaoEncontradoException::new);
    }
}