package br.ufpr.tads.webequipamentos.webprojeto;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.webequipamentos.dto.NovaSolicitacaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoDetalhe;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoAberta;
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

        return service.listarDoFuncionario(
            emailDaSessao(request, "FUNCIONARIO")
        );
    }

    // RF011: o funcionário só precisa estar logado; a lista é a mesma para todos.
    @GetMapping("/abertas")
    public List<SolicitacaoAberta> listarAbertas(
            HttpServletRequest request) {

        emailDaSessao(request, "FUNCIONARIO");

        return service.listarAbertas();
    }

    // RF003
    @GetMapping("/cliente")
    public List<SolicitacaoResumo> listarDoCliente(
            HttpServletRequest request) {

        return service.listarDoCliente(
            emailDaSessao(request, "CLIENTE")
        );
    }

    // RF008
    @GetMapping("/cliente/{id}")
    public SolicitacaoDetalhe detalharDoCliente(
            @PathVariable Integer id,
            HttpServletRequest request) {

        return service.detalharDoCliente(
            emailDaSessao(request, "CLIENTE"),
            id
        );
    }

    // RF004
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoResumo criar(
            @RequestBody NovaSolicitacaoRequest req,
            HttpServletRequest request) {

        return service.criar(
            emailDaSessao(request, "CLIENTE"),
            req
        );
    }

    // Retorna o e-mail gravado no login, exigindo que o perfil da sessão seja o esperado.
    private String emailDaSessao(
            HttpServletRequest request,
            String perfil) {

        HttpSession sessao = request.getSession(false);

        if (sessao == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuario nao autenticado."
            );
        }

        Object email = sessao.getAttribute("email");

        if (!(email instanceof String)
                || ((String) email).isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Sessao sem usuario identificado."
            );
        }

        if (!perfil.equals(sessao.getAttribute("perfil"))) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Acesso nao permitido para este perfil."
            );
        }

        return ((String) email).trim();
    }
}
