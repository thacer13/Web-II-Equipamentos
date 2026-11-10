package br.ufpr.tads.webequipamentos.dao;

public interface PagamentoDao {

    int confirmarPagamento(Integer solicitacaoId, String emailCliente);

    int registrarPagamento(Integer solicitacaoId);
}