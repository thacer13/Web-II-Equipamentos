package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.model.Usuario;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UsuarioDaoImpl implements UsuarioDao {

    private static final String INSERT_USUARIO = """
        INSERT INTO usuario
            (nome, email, senha_hash, salt)
        VALUES (?, ?, ?, ?)
        RETURNING id
        """;

    private static final String INSERT_ENDERECO = """
        INSERT INTO endereco
            (cep, logradouro, numero, bairro, cidade, estado)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
        """;

    private static final String INSERT_CLIENTE = """
        INSERT INTO cliente
            (id, cpf, telefone, endereco_id)
        VALUES (?, ?, ?, ?)
        """;

    private static final String SELECT_BASE = """
        SELECT u.id, c.cpf, u.nome, u.email, c.telefone, u.senha_hash,
               e.cep, e.logradouro, e.numero, e.bairro, e.cidade, e.estado
        FROM usuario u
        JOIN cliente c ON c.id = u.id
        JOIN endereco e ON e.id = c.endereco_id
        """;

    private static final String UPDATE_USUARIO = """
        UPDATE usuario
           SET nome = ?, email = ?, senha_hash = ?
         WHERE id = ?
        """;

    private static final String UPDATE_CLIENTE = """
        UPDATE cliente
           SET cpf = ?, telefone = ?
         WHERE id = ?
        """;

    private static final String UPDATE_ENDERECO = """
        UPDATE endereco
           SET cep = ?, logradouro = ?, numero = ?, bairro = ?,
               cidade = ?, estado = ?
         WHERE id = (SELECT endereco_id FROM cliente WHERE id = ?)
        """;

    private static final RowMapper<Usuario> MAPPER = (rs, rowNum) -> new Usuario(
        rs.getInt("id"),
        rs.getString("cpf"),
        rs.getString("nome"),
        rs.getString("email"),
        rs.getString("telefone"),
        rs.getString("senha_hash"),
        rs.getString("cep"),
        rs.getString("logradouro"),
        rs.getString("numero"),
        rs.getString("bairro"),
        rs.getString("cidade"),
        rs.getString("estado")
    );

    private final JdbcTemplate jdbc;

    public UsuarioDaoImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public int inserir(Usuario u) {
        int usuarioId = jdbc.queryForObject(
            INSERT_USUARIO,
            Integer.class,
            u.nome(),
            u.email(),
            u.senhaHash(),
            ""
        );

        int enderecoId = jdbc.queryForObject(
            INSERT_ENDERECO,
            Integer.class,
            u.cep(),
            u.logradouro(),
            u.numero(),
            u.bairro(),
            u.cidade(),
            u.estado()
        );

        jdbc.update(INSERT_CLIENTE, usuarioId, u.cpf(), u.telefone(), enderecoId);
        return usuarioId;
    }

    @Override
    public Optional<Usuario> buscarPorId(int id) {
        return jdbc.query(SELECT_BASE + " WHERE id = ?", MAPPER, id)
                   .stream().findFirst();
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return jdbc.query(SELECT_BASE + " WHERE email = ?", MAPPER, email)
                   .stream().findFirst();
    }

    @Override
    public boolean existePorCpf(String cpf) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM cliente WHERE cpf = ?)", Boolean.class, cpf));
    }

    @Override
    public boolean existePorEmail(String email) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM usuario WHERE email = ?)", Boolean.class, email));
    }

    @Override
    public boolean atualizar(Usuario u) {
        int usuarioLinhas = jdbc.update(
            UPDATE_USUARIO,
            u.nome(),
            u.email(),
            u.senhaHash(),
            u.id()
        );
        int clienteLinhas = jdbc.update(
            UPDATE_CLIENTE,
            u.cpf(),
            u.telefone(),
            u.id()
        );
        int enderecoLinhas = jdbc.update(
            UPDATE_ENDERECO,
            u.cep(),
            u.logradouro(),
            u.numero(),
            u.bairro(),
            u.cidade(),
            u.estado(),
            u.id()
        );
        return usuarioLinhas > 0 && clienteLinhas > 0 && enderecoLinhas > 0;
    }

    @Override
    public boolean excluir(int id) {
        Integer enderecoId = jdbc.query(
            "SELECT endereco_id FROM cliente WHERE id = ?",
            (rs, rowNum) -> rs.getInt("endereco_id"),
            id
        ).stream().findFirst().orElse(null);

        int clienteLinhas = jdbc.update("DELETE FROM cliente WHERE id = ?", id);
        int usuarioLinhas = jdbc.update("DELETE FROM usuario WHERE id = ?", id);

        if (enderecoId != null) {
            jdbc.update("DELETE FROM endereco WHERE id = ?", enderecoId);
        }

        return clienteLinhas > 0 && usuarioLinhas > 0;
    }
}