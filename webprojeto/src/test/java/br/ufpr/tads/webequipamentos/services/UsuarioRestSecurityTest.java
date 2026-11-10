package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.config.SecurityConfig;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.webprojeto.WebprojetoApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UsuarioREST.class)
@Import(SecurityConfig.class)
@ContextConfiguration(classes = WebprojetoApplication.class)
class UsuarioRestSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private AutenticacaoService autenticacaoService;

    @Test
    void exigeAutenticacaoParaListarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void clienteNaoPodeListarDadosDeOutrosUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios").with(user("cliente@example.com").roles("CLIENTE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void cadastroGenericoDeUsuarioNaoFicaPublico() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void atualizacaoEncaminhaIdentidadeAutenticadaEExcluiDadosDeSenhaDaResposta() throws Exception {
        UsuarioResponse resposta = new UsuarioResponse(42, "Maria", "maria@example.com", "CLIENTE");
        when(usuarioService.atualizar(eq(42), any(), eq("maria@example.com"))).thenReturn(resposta);

        mockMvc.perform(put("/api/usuarios/42")
                .with(user("maria@example.com").roles("CLIENTE"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "cpf": "52998224725",
                      "nome": "Maria Souza",
                      "email": "maria@example.com",
                      "telefone": "41999998888",
                      "cep": "80060000",
                      "logradouro": "Rua XV de Novembro",
                      "numero": "10",
                      "bairro": "Centro",
                      "cidade": "Curitiba",
                      "estado": "PR"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.senha").doesNotExist())
            .andExpect(jsonPath("$.senhaHash").doesNotExist())
            .andExpect(jsonPath("$.salt").doesNotExist());

        verify(usuarioService).atualizar(eq(42), any(), eq("maria@example.com"));
    }

    @Test
    void clienteNaoPodeDesativarUsuario() throws Exception {
        mockMvc.perform(delete("/api/usuarios/42")
                .with(user("cliente@example.com").roles("CLIENTE"))
                .with(csrf()))
            .andExpect(status().isForbidden());
    }

    @Test
    void funcionarioNaoPodeConsultarSolicitacoesDeCliente() throws Exception {
        mockMvc.perform(get("/api/solicitacoes/cliente")
                .with(user("funcionario@example.com").roles("FUNCIONARIO")))
            .andExpect(status().isForbidden());
    }

    @Test
    void funcionarioPodeListarUsuarios() throws Exception {
        when(usuarioService.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/usuarios")
                .with(user("funcionario@example.com").roles("FUNCIONARIO")))
            .andExpect(status().isOk());

        verify(usuarioService).listar();
    }
}
