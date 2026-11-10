package br.ufpr.tads.webequipamentos.dao;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SolicitacaoDaoImplTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final SolicitacaoDaoImpl dao = new SolicitacaoDaoImpl(jdbc);

    // RF013: o detalhe usa a mesma regra da listagem, então trocar o id na URL não expõe nada.
    @Test
    @SuppressWarnings("unchecked")
    void detalheDoFuncionarioUsaARegraDeVisibilidadeDaListagem() {
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenReturn(List.of());

        dao.listarVisiveis("maria@teste.com");
        dao.buscarVisivelAoFuncionario(7, "maria@teste.com");

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).query(sql.capture(), any(RowMapper.class), eq("maria@teste.com"));
        String listagem = sql.getValue();

        verify(jdbc).query(sql.capture(), any(RowMapper.class), eq("maria@teste.com"), eq(7));
        String detalhe = sql.getValue();

        String regra = listagem.substring(listagem.indexOf("WHERE ((s.estado"), listagem.indexOf("ORDER BY"));
        assertTrue(detalhe.contains(regra.strip()));
        assertTrue(detalhe.contains("AND s.id = ?"));
        assertTrue(regra.contains("WHEN s.estado = 'REDIRECIONADA' THEN s.funcionario_atual_id"));
    }
}
