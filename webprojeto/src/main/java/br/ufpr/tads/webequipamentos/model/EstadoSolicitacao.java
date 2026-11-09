package br.ufpr.tads.webequipamentos.model;

import br.ufpr.tads.webequipamentos.exception.ConflitoException;

import java.util.Arrays;
import java.util.Set;

// Estados e transições permitidas de uma solicitação (contrato em docs/contratos-api.md).
public enum EstadoSolicitacao {
    ABERTA("ABERTA"),
    ORCADA("ORÇADA"),
    APROVADA("APROVADA"),
    REJEITADA("REJEITADA"),
    REDIRECIONADA("REDIRECIONADA"),
    ARRUMADA("ARRUMADA"),
    PAGA("PAGA"),
    FINALIZADA("FINALIZADA");

    // Valor gravado nas colunas estado/estado_anterior/estado_novo.
    private final String valorBanco;

    EstadoSolicitacao(String valorBanco) {
        this.valorBanco = valorBanco;
    }

    public String valorBanco() {
        return valorBanco;
    }

    public Set<EstadoSolicitacao> proximos() {
        return switch (this) {
            case ABERTA -> Set.of(ORCADA);
            case ORCADA -> Set.of(APROVADA, REJEITADA);
            case REJEITADA -> Set.of(APROVADA);
            case APROVADA -> Set.of(REDIRECIONADA, ARRUMADA);
            case REDIRECIONADA -> Set.of(REDIRECIONADA, ARRUMADA);
            case ARRUMADA -> Set.of(PAGA);
            case PAGA -> Set.of(FINALIZADA);
            case FINALIZADA -> Set.of();
        };
    }

    public boolean podeIrPara(EstadoSolicitacao destino) {
        return proximos().contains(destino);
    }

    // Lança 409 quando a solicitação não está num estado que permite a ação.
    public void validarTransicao(EstadoSolicitacao destino) {
        if (!podeIrPara(destino)) {
            throw new ConflitoException(
                "Solicitação em " + valorBanco + " não pode passar para " + destino.valorBanco + "."
            );
        }
    }

    public static EstadoSolicitacao doBanco(String valor) {
        return Arrays.stream(values())
            .filter(e -> e.valorBanco.equals(valor))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Estado desconhecido: " + valor));
    }
}
