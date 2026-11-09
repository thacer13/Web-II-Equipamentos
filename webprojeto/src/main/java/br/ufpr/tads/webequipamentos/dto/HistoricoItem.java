package br.ufpr.tads.webequipamentos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistoricoItem(
    LocalDateTime dataHora,
    String estadoAnterior,
    String estado,
    String funcionario,
    String funcionarioDestino,
    BigDecimal valor,
    String motivo,
    String descricaoManutencao,
    String orientacoesCliente
) {}
