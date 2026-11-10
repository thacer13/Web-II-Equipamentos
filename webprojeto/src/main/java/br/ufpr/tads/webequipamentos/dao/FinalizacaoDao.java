package br.ufpr.tads.webequipamentos.dao;

import java.util.Optional;

public interface FinalizacaoDao {

    Optional<String> buscarEstadoDoFuncionario(Integer solicitacaoId, String emailFuncionario);

    int finalizar(Integer solicitacaoId, String emailFuncionario);

    int registrarFinalizacao(Integer solicitacaoId, String emailFuncionario);
}