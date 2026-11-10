package br.ufpr.tads.webequipamentos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReceitaDia(LocalDate data, long quantidade, BigDecimal receita) {}
