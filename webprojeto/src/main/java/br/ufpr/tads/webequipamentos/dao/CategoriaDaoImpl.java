package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.model.CategoriaEquipamento;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoriaDaoImpl implements CategoriaDao {

    private static final RowMapper<CategoriaEquipamento> MAPPER = (rs, rowNum) ->
        new CategoriaEquipamento(
            rs.getInt("id"),
            rs.getString("nome"),
            rs.getBoolean("ativo")
        );

    private final JdbcTemplate jdbc;

    public CategoriaDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<CategoriaEquipamento> listar() {
        return jdbc.query(
            "SELECT id, nome, ativo FROM categoria_equipamento ORDER BY nome, id",
            MAPPER
        );
    }

    @Override
    public Optional<CategoriaEquipamento> buscarPorId(int id) {
        return jdbc.query(
            "SELECT id, nome, ativo FROM categoria_equipamento WHERE id = ?",
            MAPPER,
            id
        ).stream().findFirst();
    }

    @Override
    public boolean existePorNome(String nome, Integer ignorarId) {
        String sql = ignorarId == null
            ? "SELECT EXISTS (SELECT 1 FROM categoria_equipamento WHERE LOWER(nome) = LOWER(?))"
            : "SELECT EXISTS (SELECT 1 FROM categoria_equipamento WHERE LOWER(nome) = LOWER(?) AND id <> ?)";
        return ignorarId == null
            ? Boolean.TRUE.equals(jdbc.queryForObject(sql, Boolean.class, nome))
            : Boolean.TRUE.equals(jdbc.queryForObject(sql, Boolean.class, nome, ignorarId));
    }

    @Override
    public int inserir(String nome) {
        return jdbc.queryForObject("""
            INSERT INTO categoria_equipamento (nome, ativo)
            VALUES (?, TRUE)
            RETURNING id
            """, Integer.class, nome);
    }

    @Override
    public boolean atualizar(int id, String nome) {
        return jdbc.update(
            "UPDATE categoria_equipamento SET nome = ? WHERE id = ?",
            nome,
            id
        ) == 1;
    }

    @Override
    public boolean desativar(int id) {
        return jdbc.update(
            "UPDATE categoria_equipamento SET ativo = FALSE WHERE id = ? AND ativo = TRUE",
            id
        ) == 1;
    }
}
