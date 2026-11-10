package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.config.SecurityConfig;
import br.ufpr.tads.webequipamentos.dto.ReceitaDia;
import br.ufpr.tads.webequipamentos.services.RelatorioReceitasService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RelatorioReceitasController.class)
@Import(SecurityConfig.class)
@ContextConfiguration(classes = WebprojetoApplication.class)
class RelatorioReceitasControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RelatorioReceitasService service;

    @Test
    void exigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/relatorios/receitas"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void restringeRelatorioAFuncionarios() throws Exception {
        mockMvc.perform(get("/api/relatorios/receitas")
                .with(user("cliente@example.com").roles("CLIENTE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void funcionarioConsultaPeriodoERecebeAgregadosDoBanco() throws Exception {
        LocalDate inicio = LocalDate.of(2026, 11, 1);
        LocalDate fim = LocalDate.of(2026, 11, 30);
        when(service.listar(inicio, fim)).thenReturn(List.of(
            new ReceitaDia(LocalDate.of(2026, 11, 9), 2, new BigDecimal("375.50"))
        ));

        mockMvc.perform(get("/api/relatorios/receitas")
                .param("inicio", "2026-11-01")
                .param("fim", "2026-11-30")
                .with(user("funcionario@example.com").roles("FUNCIONARIO")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].data").value("2026-11-09"))
            .andExpect(jsonPath("$[0].quantidade").value(2))
            .andExpect(jsonPath("$[0].receita").value(375.5));

        verify(service).listar(inicio, fim);
    }
}
