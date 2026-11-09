package br.ufpr.tads.webequipamentos.dto;

public record NovaSolicitacaoRequest(
    String descricaoEquipamento,
    Integer categoriaId,
    String descricaoDefeito
) {}
