package br.ufpr.tads.webequipamentos.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistoricoSolicitacao(
    Integer id,
    Integer solicitacaoId,
    LocalDateTime dataHora,
    String estadoAnterior,
    String estadoNovo,
    Integer funcionarioId,
    Integer funcionarioDestinoId,
    BigDecimal valor,
    String motivo,
    String descricaoManutencao,
    String orientacoesCliente
) {}
