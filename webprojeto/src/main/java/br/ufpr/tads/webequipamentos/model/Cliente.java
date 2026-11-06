package br.ufpr.tads.webequipamentos.model;

public record Cliente(
    Integer id,
    String cpf,
    String telefone,
    Integer enderecoId
) {}
