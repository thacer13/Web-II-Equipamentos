package br.ufpr.tads.webequipamentos.dao;

import java.util.Optional;

public interface ManutencaoDao {
    Optional<String> buscarEstadoDoFuncionario(Integer solicitacaoId, String emailFuncionario);

    int concluir(Integer solicitacaoId, String emailFuncionario, String estadoAtual);

    int registrarHistorico(Integer solicitacaoId, String emailFuncionario, String estadoAnterior,
                           String descricaoManutencao, String orientacoesCliente);
}
