package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.config.SecurityConfig;
import br.ufpr.tads.webequipamentos.dto.ReceitaCategoria;
import br.ufpr.tads.webequipamentos.services.RelatorioReceitasCategoriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RelatorioReceitasCategoriaController.class)
@Import(SecurityConfig.class)
@ContextConfiguration(classes = WebprojetoApplication.class)
class RelatorioReceitasCategoriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RelatorioReceitasCategoriaService service;

    @Test
    void exigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/relatorios/receitas-categoria"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void restringeRelatorioAFuncionarios() throws Exception {
        mockMvc.perform(get("/api/relatorios/receitas-categoria")
                .with(user("cliente@example.com").roles("CLIENTE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void funcionarioRecebeReceitaAgrupadaPorCategoria() throws Exception {
        var receitas = List.of(
            new ReceitaCategoria("Notebook", 2, new BigDecimal("450.00")),
            new ReceitaCategoria("Teclado", 1, new BigDecimal("75.50"))
        );
        when(service.listar()).thenReturn(receitas);

        mockMvc.perform(get("/api/relatorios/receitas-categoria")
                .with(user("funcionario@example.com").roles("FUNCIONARIO")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].categoria").value("Notebook"))
            .andExpect(jsonPath("$[0].quantidade").value(2))
            .andExpect(jsonPath("$[0].receita").value(450.0))
            .andExpect(jsonPath("$[1].categoria").value("Teclado"))
            .andExpect(jsonPath("$[1].receita").value(75.5));

        verify(service).listar();
    }
}
