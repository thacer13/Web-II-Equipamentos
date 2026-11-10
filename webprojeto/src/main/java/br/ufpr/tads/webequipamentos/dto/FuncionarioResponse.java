package br.ufpr.tads.webequipamentos.dto;

import java.time.LocalDate;

public record FuncionarioResponse(
    Integer id,
    String nome,
    String email,
    String perfil,
    LocalDate dataNascimento,
    boolean ativo
) {}
