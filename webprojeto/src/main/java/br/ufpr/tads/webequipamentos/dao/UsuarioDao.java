package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.model.Usuario;

import java.util.Optional;

public interface UsuarioDao {

    int inserir(Usuario usuario);                 // CREATE, devolve o id gerado
    Optional<Usuario> buscarPorId(int id);        // READ
    Optional<Usuario> buscarPorEmail(String email); // READ (usado no login)
    boolean existePorCpf(String cpf);
    boolean existePorEmail(String email);
    boolean atualizar(Usuario usuario);           // UPDATE
    boolean excluir(int id);                      // DELETE
}