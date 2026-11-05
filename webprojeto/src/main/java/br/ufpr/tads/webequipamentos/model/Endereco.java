package br.ufpr.tads.webequipamentos.model;

public record Endereco(
    Integer id,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado
) {}
