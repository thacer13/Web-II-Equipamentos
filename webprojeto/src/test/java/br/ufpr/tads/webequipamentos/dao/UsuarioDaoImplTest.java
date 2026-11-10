package br.ufpr.tads.webequipamentos.dao;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UsuarioDaoImplTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final UsuarioDaoImpl dao = new UsuarioDaoImpl(jdbc);

    @Test
    void desativarPreservaUsuarioEnderecoESolicitacoes() {
        when(jdbc.update(
            eq("UPDATE cliente SET ativo = FALSE WHERE id = ? AND ativo = TRUE"),
            eq(42)
        )).thenReturn(1);

        assertTrue(dao.desativar(42));

        verify(jdbc).update(
            "UPDATE cliente SET ativo = FALSE WHERE id = ? AND ativo = TRUE",
            42
        );
    }
}
