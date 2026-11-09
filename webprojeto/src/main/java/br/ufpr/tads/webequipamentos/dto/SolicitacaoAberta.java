package br.ufpr.tads.webequipamentos.dto;

import java.time.LocalDateTime;

public record SolicitacaoAberta(
    Integer id,
    LocalDateTime dataHora,
    String cliente,
    String descricaoEquipamento,
    String categoriaEquipamento,
    String descricaoDefeito
) {}
