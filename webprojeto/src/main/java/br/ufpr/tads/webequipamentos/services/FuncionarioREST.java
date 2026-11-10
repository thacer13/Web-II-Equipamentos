package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dto.FuncionarioRequest;
import br.ufpr.tads.webequipamentos.dto.FuncionarioResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioREST {

    private final FuncionarioService service;
    private final SecurityContextRepository securityContextRepository;

    public FuncionarioREST(
            FuncionarioService service,
            SecurityContextRepository securityContextRepository) {
        this.service = service;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping
    public List<FuncionarioResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public FuncionarioResponse buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FuncionarioResponse cadastrar(@RequestBody FuncionarioRequest request) {
        return service.cadastrar(request);
    }

    @PutMapping("/{id}")
    public FuncionarioResponse atualizar(
            @PathVariable Integer id,
            @RequestBody FuncionarioRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        FuncionarioResponse atual = service.buscar(id);
        FuncionarioResponse atualizado = service.atualizar(id, request);
        if (atual.email().equalsIgnoreCase(authentication.getName())
                && !atualizado.email().equalsIgnoreCase(authentication.getName())) {
            Authentication atualizada = UsernamePasswordAuthenticationToken.authenticated(
                atualizado.email(),
                null,
                authentication.getAuthorities()
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(atualizada);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, servletRequest, servletResponse);

            HttpSession session = servletRequest.getSession(false);
            if (session != null) {
                session.setAttribute("email", atualizado.email());
            }
        }
        return atualizado;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(
            @PathVariable Integer id,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        HttpSession session = servletRequest.getSession(false);
        Object idSessao = session == null ? null : session.getAttribute("id");
        Integer idAutenticado = idSessao instanceof Integer valor ? valor : null;
        service.desativar(id, idAutenticado, authentication.getName());
    }

    @PostMapping("/{id}/redefinir-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void redefinirSenha(@PathVariable Integer id) {
        service.redefinirSenha(id);
    }
}
