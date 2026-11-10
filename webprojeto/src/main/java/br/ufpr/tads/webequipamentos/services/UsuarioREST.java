package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioREST {

    private final UsuarioService service;
    private final AutenticacaoService autenticacaoService;
    private final SecurityContextRepository securityContextRepository;

    public UsuarioREST(
            UsuarioService service,
            AutenticacaoService autenticacaoService,
            SecurityContextRepository securityContextRepository) {
        this.service = service;
        this.autenticacaoService = autenticacaoService;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping
    public List<UsuarioResponse> obterTodosUsuarios() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obterUsuarioPorId(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse inserir(@RequestBody CadastroRequest request) {
        return service.cadastrar(request);
    }

    @PostMapping("/login")
    public UsuarioResponse login(
        @RequestBody LoginRequest request,
        HttpServletRequest servletRequest,
        HttpServletResponse servletResponse
    ) {
        return autenticacaoService.login(request, servletRequest, servletResponse);
    }

    @PutMapping("/{id}")
    public UsuarioResponse alterar(
        @PathVariable Integer id,
        @RequestBody CadastroRequest request,
        Authentication authentication,
        HttpServletRequest servletRequest,
        HttpServletResponse servletResponse
    ) {
        UsuarioResponse usuario = service.atualizar(id, request, authentication.getName());
        if (!authentication.getName().equals(usuario.email())) {
            Authentication atualizada = UsernamePasswordAuthenticationToken.authenticated(
                usuario.email(),
                null,
                authentication.getAuthorities()
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(atualizada);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, servletRequest, servletResponse);

            HttpSession session = servletRequest.getSession(false);
            if (session != null) {
                session.setAttribute("email", usuario.email());
            }
        }
        return usuario;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Integer id, Authentication authentication) {
        service.desativar(id, authentication.getName());
    }
}
