package br.ufpr.tads.webequipamentos.dto;

public record CadastroRequest(
    String cpf,
    String nome,
    String email,
    String telefone,
    String senha,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado
) {}
