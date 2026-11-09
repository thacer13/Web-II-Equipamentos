package br.ufpr.tads.webequipamentos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SolicitacaoDetalhe(
    Integer id,
    LocalDateTime dataHora,
    String descricaoEquipamento,
    String descricaoDefeito,
    String categoriaEquipamento,
    String estado,
    BigDecimal precoOrcado,
    List<HistoricoItem> historico
) {}
