package br.ufpr.tads.webequipamentos.webprojeto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.services.FinalizacaoService;

class FinalizacaoControllerTest {

    private final FinalizacaoService service = mock(FinalizacaoService.class);
    private final FinalizacaoController controller = new FinalizacaoController(service);

    @Test
    void rejeitaSemSessao() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        ResponseStatusException erro = assertThrows(ResponseStatusException.class,
            () -> controller.finalizar(7, request));
        assertEquals(HttpStatus.UNAUTHORIZED, erro.getStatusCode());
        verifyNoInteractions(service);
    }

    @Test
    void rejeitaCliente() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession sessao = new MockHttpSession();
        sessao.setAttribute("email", "cliente@teste.com");
        sessao.setAttribute("perfil", "CLIENTE");
        request.setSession(sessao);

        ResponseStatusException erro = assertThrows(ResponseStatusException.class,
            () -> controller.finalizar(7, request));
        assertEquals(HttpStatus.FORBIDDEN, erro.getStatusCode());
        verifyNoInteractions(service);
    }

    @Test
    void usaFuncionarioDaSessao() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession sessao = new MockHttpSession();
        sessao.setAttribute("email", " maria@teste.com ");
        sessao.setAttribute("perfil", "FUNCIONARIO");
        request.setSession(sessao);

        SolicitacaoResumo resumo = new SolicitacaoResumo(7,
            LocalDateTime.of(2026, 11, 9, 15, 30), "Notebook", "Tela com defeito",
            "Notebook", "FINALIZADA", new BigDecimal("250.00"));
        when(service.finalizar("maria@teste.com", 7)).thenReturn(resumo);

        assertEquals(resumo, controller.finalizar(7, request));
        verify(service).finalizar("maria@teste.com", 7);
    }
}