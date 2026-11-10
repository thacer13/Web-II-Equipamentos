package br.ufpr.tads.webequipamentos.webprojeto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.services.PagamentoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/solicitacoes")
public class PagamentoController {

    private final PagamentoService service;

    public PagamentoController(PagamentoService service) {
        this.service = service;
    }

    @PostMapping("/{id}/pagamento")
    public SolicitacaoResumo pagar(
        @PathVariable Integer id,
        HttpServletRequest request
    ) {
        HttpSession sessao = request.getSession(false);

        if (sessao == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuario nao autenticado."
            );
        }

        Object email = sessao.getAttribute("email");

        if (!(email instanceof String) || ((String) email).isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Sessao sem usuario identificado."
            );
        }

        if (!"CLIENTE".equals(sessao.getAttribute("perfil"))) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Apenas o cliente pode pagar o servico."
            );
        }

        return service.pagar(((String) email).trim(), id);
    }
}