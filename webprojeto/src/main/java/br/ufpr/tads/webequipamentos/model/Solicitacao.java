package br.ufpr.tads.webequipamentos.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Solicitacao(
    Integer id,
    Integer clienteId,
    Integer categoriaId,
    String descricaoEquipamento,
    String descricaoDefeito,
    LocalDateTime dataHoraAbertura,
    String estado,
    BigDecimal valorOrcamento,
    Integer funcionarioOrcamentoId,
    LocalDateTime dataHoraOrcamento,
    Integer funcionarioAtualId,
    LocalDateTime dataHoraPagamento,
    Integer funcionarioFinalizacaoId,
    LocalDateTime dataHoraFinalizacao
) {}
