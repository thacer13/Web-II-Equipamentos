package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.services.PagamentoService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PagamentoControllerTest {

    private final PagamentoService service = mock(PagamentoService.class);

    private final PagamentoController controller =
        new PagamentoController(service);

    @Test
    void exigeSessao() {
        MockHttpServletRequest request =
            new MockHttpServletRequest();

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.pagar(7, request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, erro.getStatusCode());
        verifyNoInteractions(service);
    }

    @Test
    void bloqueiaPerfilFuncionario() {
        MockHttpServletRequest request =
            new MockHttpServletRequest();

        MockHttpSession sessao = new MockHttpSession();

        sessao.setAttribute("email", "maria@teste.com");
        sessao.setAttribute("perfil", "FUNCIONARIO");

        request.setSession(sessao);

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.pagar(7, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, erro.getStatusCode());
        verifyNoInteractions(service);
    }

    @Test
    void usaEmailDaSessaoDoCliente() {
        MockHttpServletRequest request =
            new MockHttpServletRequest();

        MockHttpSession sessao = new MockHttpSession();

        sessao.setAttribute("email", " joao@teste.com ");
        sessao.setAttribute("perfil", "CLIENTE");

        request.setSession(sessao);

        SolicitacaoResumo resumo = new SolicitacaoResumo(
            7,
            LocalDateTime.of(2026, 11, 9, 15, 30),
            "Notebook",
            "Tela com defeito",
            "Notebook",
            "PAGA",
            new BigDecimal("250.00")
        );

        when(service.pagar("joao@teste.com", 7))
            .thenReturn(resumo);

        assertEquals(resumo, controller.pagar(7, request));

        verify(service).pagar("joao@teste.com", 7);
    }
}