package br.ufpr.tads.webequipamentos.model;
public record Usuario(
    Integer id,
    String cpf,
    String nome,
    String email,
    String telefone,
    String senhaHash,
    String salt,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String estado
) {}