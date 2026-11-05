package br.ufpr.tads.webequipamentos.model;

import java.time.LocalDate;

public record Funcionario(
    Integer id,
    LocalDate dataNascimento,
    boolean ativo
) {}
