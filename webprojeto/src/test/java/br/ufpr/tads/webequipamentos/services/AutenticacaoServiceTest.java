package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.mockito.ArgumentCaptor;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.same;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutenticacaoServiceTest {

    private final UsuarioService usuarioService = mock(UsuarioService.class);
    private final SecurityContextRepository securityContextRepository =
        mock(SecurityContextRepository.class);
    private final AutenticacaoService service =
        new AutenticacaoService(usuarioService, securityContextRepository);

    @AfterEach
    void limpaContextoDeSeguranca() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginCriaContextoSpringEGravaPerfilNaSessao() {
        LoginRequest credenciais = new LoginRequest("cliente@teste.com", "senha");
        UsuarioResponse usuario =
            new UsuarioResponse(7, "João", "cliente@teste.com", "CLIENTE");
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpServletResponse response = new MockHttpServletResponse();
        when(usuarioService.login(credenciais)).thenReturn(usuario);

        assertEquals(usuario, service.login(credenciais, request, response));

        assertEquals("cliente@teste.com", request.getSession(false).getAttribute("email"));
        assertEquals("CLIENTE", request.getSession(false).getAttribute("perfil"));

        ArgumentCaptor<SecurityContext> contextCaptor =
            ArgumentCaptor.forClass(SecurityContext.class);
        verify(securityContextRepository).saveContext(
            contextCaptor.capture(),
            same(request),
            eq(response)
        );
        assertNotNull(contextCaptor.getValue().getAuthentication());
        assertEquals("cliente@teste.com",
            contextCaptor.getValue().getAuthentication().getPrincipal());
        assertEquals("ROLE_CLIENTE",
            contextCaptor.getValue().getAuthentication().getAuthorities().iterator().next().getAuthority());
    }
}
