package br.ufpr.tads.webequipamentos.dto;

public record ClienteDaSolicitacao(
    String nome,
    String cpf,
    String email,
    String telefone,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado
) {}
