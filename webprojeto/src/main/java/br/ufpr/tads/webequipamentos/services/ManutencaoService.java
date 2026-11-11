package br.ufpr.tads.webequipamentos.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufpr.tads.webequipamentos.dao.ManutencaoDao;
import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.ManutencaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.AcessoNegadoException;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.EstadoSolicitacao;

@Service
public class ManutencaoService {

    private static final int TAMANHO_MAXIMO = 2000;

    private final ManutencaoDao manutencaoDao;
    private final SolicitacaoDao solicitacaoDao;

    public ManutencaoService(ManutencaoDao manutencaoDao, SolicitacaoDao solicitacaoDao) {
        this.manutencaoDao = manutencaoDao;
        this.solicitacaoDao = solicitacaoDao;
    }

    @Transactional
    public SolicitacaoResumo concluir(String emailFuncionario, Integer solicitacaoId, ManutencaoRequest req) {
        if (emailFuncionario == null || emailFuncionario.isBlank()) {
            throw new IllegalArgumentException("Funcionário não identificado.");
        }
        if (solicitacaoId == null || solicitacaoId <= 0) {
            throw new IllegalArgumentException("Solicitação inválida.");
        }

        String descricao = normalizar(req == null ? null : req.descricaoManutencao());
        String orientacoes = normalizar(req == null ? null : req.orientacoesCliente());
        validarTexto(descricao, "A descrição da manutenção");
        validarTexto(orientacoes, "As orientações ao cliente");

        String email = emailFuncionario.trim();
        String estadoBanco = manutencaoDao.buscarEstadoDoFuncionario(solicitacaoId, email)
            .orElseGet(() -> {
                solicitacaoDao.buscarResumo(solicitacaoId).orElseThrow(NaoEncontradoException::new);
                throw new AcessoNegadoException("Funcionário não é responsável por esta solicitação.");
            });
        EstadoSolicitacao estadoAtual = EstadoSolicitacao.doBanco(estadoBanco);
        estadoAtual.validarTransicao(EstadoSolicitacao.ARRUMADA);

        if (manutencaoDao.concluir(solicitacaoId, email, estadoAtual.valorBanco()) != 1) {
            throw new ConflitoException("A solicitação foi alterada ou não está mais atribuída a você.");
        }

        if (manutencaoDao.registrarHistorico(
                solicitacaoId, email, estadoAtual.valorBanco(), descricao, orientacoes) != 1) {
            throw new IllegalStateException("Não foi possível registrar o histórico da manutenção.");
        }

        return solicitacaoDao.buscarResumo(solicitacaoId).orElseThrow(NaoEncontradoException::new);
    }

    private static void validarTexto(String texto, String campo) {
        if (texto.length() < 3 || texto.length() > TAMANHO_MAXIMO) {
            throw new IllegalArgumentException(campo + " deve ter entre 3 e 2000 caracteres.");
        }
    }

    private static String normalizar(String texto) {
        return texto == null ? "" : texto.trim().replaceAll("\\s+", " ");
    }
}
