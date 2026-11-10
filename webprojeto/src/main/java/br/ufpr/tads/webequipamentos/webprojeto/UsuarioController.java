package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.services.AutenticacaoService;
import br.ufpr.tads.webequipamentos.services.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.CompositeLogoutHandler;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService service;
    private final AutenticacaoService autenticacaoService;
    private final SecurityContextLogoutHandler securityContextLogoutHandler =
        new SecurityContextLogoutHandler();
    private final LogoutHandler logoutHandler = new CompositeLogoutHandler(
        securityContextLogoutHandler,
        new CookieClearingLogoutHandler("JSESSIONID")
    );

    public UsuarioController(UsuarioService service, AutenticacaoService autenticacaoService) {
        this.service = service;
        this.autenticacaoService = autenticacaoService;
        securityContextLogoutHandler.setInvalidateHttpSession(true);
        securityContextLogoutHandler.setClearAuthentication(true);
    }

    @GetMapping("/auth/csrf")
    public CsrfToken csrfToken(CsrfToken csrfToken) {
        return csrfToken;
    }

    @GetMapping("/auth/session")
    public UsuarioResponse sessao(Authentication authentication) {
        return service.buscarAutenticado(authentication.getName());
    }

    @PostMapping("/auth/login")
    public UsuarioResponse login(
            @RequestBody LoginRequest req,
            HttpServletRequest request,
            HttpServletResponse response) {
        return autenticacaoService.login(req, request, response);
    }

    @PostMapping("/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        logoutHandler.logout(
            request,
            response,
            SecurityContextHolder.getContext().getAuthentication()
        );
    }

    @PostMapping("/clientes")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@RequestBody CadastroRequest req) {
        return service.cadastrar(req);
    }
}