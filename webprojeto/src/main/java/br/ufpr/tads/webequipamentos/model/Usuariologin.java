package br.ufpr.tads.webequipamentos.model;


public record UsuarioLogin(
    Integer id,
    String nome,
    String email,
    String senhaHash,
    String salt,
    String perfil
) {}