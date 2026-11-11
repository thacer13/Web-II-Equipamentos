package br.ufpr.tads.webequipamentos.dao;

import java.util.Optional;

public interface RedirecionamentoDao {

    record OrigemSolicitacao(String estado, int funcionarioOrigemId) {}

    Optional<OrigemSolicitacao> buscarOrigem(Integer solicitacaoId, String emailFuncionario);

    boolean funcionarioAtivo(int funcionarioId);

    int redirecionar(Integer solicitacaoId, int funcionarioDestinoId, String estadoAtual);

    int registrarHistorico(Integer solicitacaoId, int funcionarioOrigemId, int funcionarioDestinoId, String estadoAnterior);
}
