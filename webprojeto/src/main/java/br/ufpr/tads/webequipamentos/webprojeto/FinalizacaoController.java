package br.ufpr.tads.webequipamentos.webprojeto;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.services.FinalizacaoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/solicitacoes")
public class FinalizacaoController {

    private final FinalizacaoService service;

    public FinalizacaoController(FinalizacaoService service) {
        this.service = service;
    }

    @PostMapping("/{id}/finalizacao")
    public SolicitacaoResumo finalizar(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);

        if (sessao == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
        }

        Object email = sessao.getAttribute("email");
        if (!(email instanceof String) || ((String) email).isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão sem usuário identificado.");
        }

        if (!"FUNCIONARIO".equals(sessao.getAttribute("perfil"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas funcionários podem finalizar serviços.");
        }

        return service.finalizar(((String) email).trim(), id);
    }
}