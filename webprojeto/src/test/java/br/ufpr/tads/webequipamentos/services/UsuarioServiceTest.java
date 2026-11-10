package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.UsuarioDao;
import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.model.Usuario;
import br.ufpr.tads.webequipamentos.model.UsuarioLogin;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UsuarioServiceTest {

    private final UsuarioDao dao = mock(UsuarioDao.class);
    private final SenhaHash senhaHash = new SenhaHash();
    private final EmailService emailService = mock(EmailService.class);
    private final UsuarioService service = new UsuarioService(dao, senhaHash, emailService);

    @Test
    void cadastraComComplementoSenhaHashSaltEPermiteLoginComSenhaEnviada() {
        when(dao.inserir(any(Usuario.class))).thenReturn(42);

        UsuarioResponse cadastrado = service.cadastrar(cadastro());

        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(dao).inserir(usuarioCaptor.capture());
        Usuario usuario = usuarioCaptor.getValue();
        ArgumentCaptor<String> senhaCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).enviarEmailCadastro(
            org.mockito.ArgumentMatchers.eq(usuario.email()),
            senhaCaptor.capture()
        );
        String senhaEnviada = senhaCaptor.getValue();

        assertEquals("apto 12", usuario.complemento());
        assertTrue(senhaEnviada.matches("\\d{4}"));
        assertNotEquals(senhaEnviada, usuario.senhaHash());
        assertTrue(senhaHash.confere(senhaEnviada, usuario.salt(), usuario.senhaHash()));
        assertEquals(new UsuarioResponse(42, "Maria Souza", "maria@example.com", "CLIENTE"), cadastrado);

        when(dao.buscarParaLogin("maria@example.com")).thenReturn(Optional.of(
            new UsuarioLogin(42, usuario.nome(), usuario.email(), usuario.senhaHash(), usuario.salt(), "CLIENTE")
        ));
        assertEquals(cadastrado, service.login(new LoginRequest("maria@example.com", senhaEnviada)));
    }

    @Test
    void rejeitaCpfJaCadastradoAntesDeGravarOuEnviarEmail() {
        when(dao.existePorCpf("52998224725")).thenReturn(true);

        assertThrows(ConflitoException.class, () -> service.cadastrar(cadastro()));

        verify(dao, org.mockito.Mockito.never()).inserir(any(Usuario.class));
        verify(emailService, org.mockito.Mockito.never()).enviarEmailCadastro(any(), any());
    }

    @Test
    void rejeitaEmailJaCadastradoIgnorandoMaiusculas() {
        when(dao.existePorEmail("maria@example.com")).thenReturn(true);

        assertThrows(ConflitoException.class, () -> service.cadastrar(cadastro()));

        verify(dao, org.mockito.Mockito.never()).inserir(any(Usuario.class));
        verify(emailService, org.mockito.Mockito.never()).enviarEmailCadastro(any(), any());
    }

    private CadastroRequest cadastro() {
        return new CadastroRequest(
            "529.982.247-25",
            "Maria Souza",
            "Maria@Example.com",
            "(41) 99999-8888",
            "",
            "80060-000",
            "Rua XV de Novembro",
            "10",
            "apto 12",
            "Centro",
            "Curitiba",
            "PR"
        );
    }
}
