package br.ufpr.tads.webequipamentos.dto;

import java.time.LocalDate;

public record FuncionarioRequest(String nome, String email, LocalDate dataNascimento) {}
