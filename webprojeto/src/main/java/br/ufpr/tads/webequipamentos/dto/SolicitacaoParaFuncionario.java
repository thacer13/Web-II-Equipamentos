package br.ufpr.tads.webequipamentos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Dados completos vistos pelo funcionário: inclui o cliente (RF012, RF014).
public record SolicitacaoParaFuncionario(
    Integer id,
    LocalDateTime dataHora,
    String descricaoEquipamento,
    String descricaoDefeito,
    String categoriaEquipamento,
    String estado,
    BigDecimal precoOrcado,
    ClienteDaSolicitacao cliente,
    List<HistoricoItem> historico
) {}
