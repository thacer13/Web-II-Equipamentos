package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutenticacaoService {

    private final UsuarioService usuarioService;
    private final SecurityContextRepository securityContextRepository;

    public AutenticacaoService(
            UsuarioService usuarioService,
            SecurityContextRepository securityContextRepository) {
        this.usuarioService = usuarioService;
        this.securityContextRepository = securityContextRepository;
    }

    public UsuarioResponse login(
            LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        UsuarioResponse usuario = usuarioService.login(request);

        HttpSession session = servletRequest.getSession(true);
        servletRequest.changeSessionId();
        session.setAttribute("email", usuario.email());
        session.setAttribute("perfil", usuario.perfil());
        session.setAttribute("id", usuario.id());

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
            usuario.email(),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_" + usuario.perfil()))
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, servletRequest, servletResponse);

        return usuario;
    }
}
