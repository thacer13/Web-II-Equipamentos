
package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.NovaSolicitacaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoAberta;
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

    @Test
    void listagemDoClienteExigeSessao() {

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarDoCliente(request)
        );

        assertEquals(
            HttpStatus.UNAUTHORIZED,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void listagemDoClienteRejeitaFuncionario() {

        autenticar("maria@teste.com", "FUNCIONARIO");

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarDoCliente(request)
        );

        assertEquals(
            HttpStatus.FORBIDDEN,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void listagemDoClienteUsaSomenteEmailDaSessao() {

        autenticar(" joao@teste.com ", "CLIENTE");

        when(service.listarDoCliente("joao@teste.com"))
            .thenReturn(List.of());

        assertEquals(
            List.of(),
            controller.listarDoCliente(request)
        );

        verify(service).listarDoCliente("joao@teste.com");
    }

    @Test
    void abertasExigemSessao() {

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarAbertas(request)
        );

        assertEquals(
            HttpStatus.UNAUTHORIZED,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void abertasRejeitamCliente() {

        autenticar("joao@teste.com", "CLIENTE");

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.listarAbertas(request)
        );

        assertEquals(
            HttpStatus.FORBIDDEN,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void abertasListadasParaFuncionario() {

        autenticar("maria@teste.com", "FUNCIONARIO");

        SolicitacaoAberta aberta = new SolicitacaoAberta(
            3,
            LocalDateTime.of(2026, 11, 9, 8, 30),
            "João",
            "Notebook",
            "Notebook",
            "Nao liga de jeito nenhum"
        );

        when(service.listarAbertas()).thenReturn(List.of(aberta));

        assertEquals(
            List.of(aberta),
            controller.listarAbertas(request)
        );
    }

    @Test
    void detalheRejeitaFuncionario() {

        autenticar("maria@teste.com", "FUNCIONARIO");

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.detalharDoCliente(7, request)
        );

        assertEquals(
            HttpStatus.FORBIDDEN,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void detalheUsaClienteDaSessao() {

        autenticar("joao@teste.com", "CLIENTE");

        controller.detalharDoCliente(7, request);

        verify(service).detalharDoCliente("joao@teste.com", 7);
    }

    @Test
    void detalheDoFuncionarioUsaEmailDaSessao() {

        autenticar("maria@teste.com", "FUNCIONARIO");

        controller.detalharParaFuncionario(7, request);

        verify(service).detalharParaFuncionario("maria@teste.com", 7);
    }

    @Test
    void detalheDoFuncionarioRejeitaCliente() {

        autenticar("joao@teste.com", "CLIENTE");

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.detalharParaFuncionario(7, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, erro.getStatusCode());

        verifyNoInteractions(service);
    }

    @Test
    void criacaoRejeitaFuncionario() {

        autenticar("maria@teste.com", "FUNCIONARIO");

        NovaSolicitacaoRequest req = new NovaSolicitacaoRequest(
            "Notebook", 1, "Nao liga de jeito nenhum"
        );

        ResponseStatusException erro = assertThrows(
            ResponseStatusException.class,
            () -> controller.criar(req, request)
        );

        assertEquals(
            HttpStatus.FORBIDDEN,
            erro.getStatusCode()
        );

        verifyNoInteractions(service);
    }

    @Test
    void criacaoUsaClienteDaSessao() {

        autenticar("joao@teste.com", "CLIENTE");

        NovaSolicitacaoRequest req = new NovaSolicitacaoRequest(
            "Notebook", 1, "Nao liga de jeito nenhum"
        );

        SolicitacaoResumo criada = new SolicitacaoResumo(
            30,
            LocalDateTime.of(2026, 11, 9, 19, 0),
            "Notebook",
            "Nao liga de jeito nenhum",
            "Notebook",
            "ABERTA",
            null
        );

        when(service.criar("joao@teste.com", req))
            .thenReturn(criada);

        assertEquals(criada, controller.criar(req, request));

        verify(service).criar("joao@teste.com", req);
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
