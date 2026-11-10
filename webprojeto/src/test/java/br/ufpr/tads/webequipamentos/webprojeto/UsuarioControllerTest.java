package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.services.AutenticacaoService;
import br.ufpr.tads.webequipamentos.services.UsuarioService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UsuarioControllerTest {

    private final UsuarioService usuarioService = mock(UsuarioService.class);
    private final UsuarioController controller =
        new UsuarioController(usuarioService, mock(AutenticacaoService.class));

    @AfterEach
    void limpaContextoDeSeguranca() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void sessaoRetornaUsuarioParaAmbosOsPerfis() {
        for (String perfil : new String[] { "CLIENTE", "FUNCIONARIO" }) {
            String email = perfil.toLowerCase() + "@email.com";
            UsuarioResponse usuario =
                new UsuarioResponse(7, "Maria", email, perfil);
            when(usuarioService.buscarAutenticado(usuario.email())).thenReturn(usuario);
            var authentication =
                UsernamePasswordAuthenticationToken.authenticated(usuario.email(), null, java.util.List.of());

            assertEquals(usuario, controller.sessao(authentication));
            verify(usuarioService).buscarAutenticado(usuario.email());
        }
    }

    @Test
    void logoutInvalidaSessaoNoServidor() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true);
        MockHttpServletResponse response = new MockHttpServletResponse();
        SecurityContextHolder.getContext().setAuthentication(
            UsernamePasswordAuthenticationToken.authenticated(
                "maria@email.com", null, java.util.List.of()
            )
        );

        controller.logout(request, response);

        assertNull(request.getSession(false));
    }
}
