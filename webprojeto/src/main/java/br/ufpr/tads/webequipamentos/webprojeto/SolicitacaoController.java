
package br.ufpr.tads.webequipamentos.webprojeto;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.services.SolicitacaoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service) {
        this.service = service;
    }

    @GetMapping("/funcionario")
    public List<SolicitacaoResumo> listarDoFuncionario(
            HttpServletRequest request) {

        HttpSession sessao = request.getSession(false);

        if (sessao == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Funcionario nao autenticado."
            );
        }

        Object email = sessao.getAttribute("email");

        if (!(email instanceof String)
                || ((String) email).isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Sessao sem funcionario identificado."
            );
        }

        if (!"FUNCIONARIO".equals(
                sessao.getAttribute("perfil"))) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Acesso permitido somente a funcionarios."
            );
        }

        return service.listarDoFuncionario(
            ((String) email).trim()
        );
    }
}
