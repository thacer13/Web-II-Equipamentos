
package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.services.SolicitacaoService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class SolicitacaoControllerTest {

    private final SolicitacaoService service =
        mock(SolicitacaoService.class);

    private final SolicitacaoController controller =
        new SolicitacaoController(service);

    private final MockHttpServletRequest request =
        new MockHttpServletRequest();

    @Test
    void rejeitaRequisicaoSemSessao() {

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarDoFuncionario(request)
        );

        assertEquals(
            HttpStatus.UNAUTHORIZED,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void rejeitaSessaoSemEmail() {

        request.getSession(true).setAttribute(
            "perfil", "FUNCIONARIO"
        );

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarDoFuncionario(request)
        );

        assertEquals(
            HttpStatus.UNAUTHORIZED,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void rejeitaClienteMesmoComSessaoValida() {

        autenticar("cliente@teste.com", "CLIENTE");

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarDoFuncionario(request)
        );

        assertEquals(
            HttpStatus.FORBIDDEN,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void consultaSomentePeloEmailDaSessao() {

        autenticar(
            " maria@teste.com ",
            "FUNCIONARIO"
        );

        SolicitacaoResumo item = new SolicitacaoResumo(
            15,
            LocalDateTime.of(2026, 10, 29, 9, 30),
            "Notebook",
            "Nao liga",
            "Computador",
            "APROVADA",
            null
        );

        when(service.listarDoFuncionario(
            "maria@teste.com"
        )).thenReturn(List.of(item));

        List<SolicitacaoResumo> resposta =
            controller.listarDoFuncionario(request);

        assertEquals(List.of(item), resposta);

        verify(service).listarDoFuncionario(
            "maria@teste.com"
        );
    }

    @Test
    void bloqueiaPerfilAusente() {

        request.getSession(true).setAttribute(
            "email", "maria@teste.com"
        );

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarDoFuncionario(request)
        );

        assertEquals(
            HttpStatus.FORBIDDEN,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    private void autenticar(
            String email,
            String perfil) {

        request.getSession(true).setAttribute(
            "email", email
        );

        request.getSession(false).setAttribute(
            "perfil", perfil
        );
    }
}
