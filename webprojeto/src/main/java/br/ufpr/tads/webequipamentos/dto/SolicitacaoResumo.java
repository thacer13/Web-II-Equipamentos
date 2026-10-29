
package br.ufpr.tads.webequipamentos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SolicitacaoResumo(
    Integer id,
    LocalDateTime dataHora,
    String descricaoEquipamento,
    String descricaoDefeito,
    String categoriaEquipamento,
    String estado,
    BigDecimal precoOrcado
) {}
