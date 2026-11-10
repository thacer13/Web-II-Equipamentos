package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.FuncionarioResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class FuncionarioDaoImpl implements FuncionarioDao {

    private static final String SELECT_FUNCIONARIOS = """
        SELECT u.id, u.nome, u.email, f.data_nascimento, f.ativo
        FROM usuario u
        JOIN funcionario f ON f.id = u.id
        """;

    private static final RowMapper<FuncionarioResponse> MAPPER = (rs, rowNum) ->
        new FuncionarioResponse(
            rs.getInt("id"),
            rs.getString("nome"),
            rs.getString("email"),
            "FUNCIONARIO",
            rs.getObject("data_nascimento", LocalDate.class),
            rs.getBoolean("ativo")
        );

    private final JdbcTemplate jdbc;

    public FuncionarioDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<FuncionarioResponse> listar() {
        return jdbc.query(SELECT_FUNCIONARIOS + " ORDER BY u.nome, u.id", MAPPER);
    }

    @Override
    public Optional<FuncionarioResponse> buscarPorId(int id) {
        return jdbc.query(SELECT_FUNCIONARIOS + " WHERE f.id = ?", MAPPER, id)
            .stream().findFirst();
    }

    @Override
    public boolean existePorEmail(String email, Integer ignorarId) {
        String sql = ignorarId == null
            ? "SELECT EXISTS (SELECT 1 FROM usuario WHERE LOWER(email) = LOWER(?))"
            : "SELECT EXISTS (SELECT 1 FROM usuario WHERE LOWER(email) = LOWER(?) AND id <> ?)";
        return ignorarId == null
            ? Boolean.TRUE.equals(jdbc.queryForObject(sql, Boolean.class, email))
            : Boolean.TRUE.equals(jdbc.queryForObject(sql, Boolean.class, email, ignorarId));
    }

    @Override
    public int inserir(
            String nome,
            String email,
            LocalDate dataNascimento,
            String senhaHash,
            String salt) {
        int id = jdbc.queryForObject("""
            INSERT INTO usuario (nome, email, senha_hash, salt)
            VALUES (?, ?, ?, ?)
            RETURNING id
            """, Integer.class, nome, email, senhaHash, salt);
        jdbc.update("""
            INSERT INTO funcionario (id, data_nascimento, ativo)
            VALUES (?, ?, TRUE)
            """, id, dataNascimento);
        return id;
    }

    @Override
    public boolean atualizar(int id, String nome, String email, LocalDate dataNascimento) {
        int usuarioAtualizado = jdbc.update(
            "UPDATE usuario SET nome = ?, email = ? WHERE id = ?",
            nome,
            email,
            id
        );
        int funcionarioAtualizado = jdbc.update(
            "UPDATE funcionario SET data_nascimento = ? WHERE id = ?",
            dataNascimento,
            id
        );
        return usuarioAtualizado == 1 && funcionarioAtualizado == 1;
    }

    @Override
    public boolean atualizarSenha(int id, String senhaHash, String salt) {
        return jdbc.update(
            "UPDATE usuario SET senha_hash = ?, salt = ? WHERE id = ?",
            senhaHash,
            salt,
            id
        ) == 1;
    }

    @Override
    public List<Integer> bloquearFuncionariosAtivos() {
        return jdbc.query(
            "SELECT id FROM funcionario WHERE ativo = TRUE FOR UPDATE",
            (rs, rowNum) -> rs.getInt("id")
        );
    }

    @Override
    public boolean desativar(int id) {
        return jdbc.update(
            "UPDATE funcionario SET ativo = FALSE WHERE id = ? AND ativo = TRUE",
            id
        ) == 1;
    }
}
