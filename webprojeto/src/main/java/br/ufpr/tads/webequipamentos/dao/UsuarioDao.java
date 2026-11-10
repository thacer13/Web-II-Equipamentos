package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.model.Usuario;
import br.ufpr.tads.webequipamentos.model.UsuarioLogin;

import java.util.Optional;
import java.util.List;

public interface UsuarioDao {

    int inserir(Usuario usuario);                         
    List<Usuario> listar();
    Optional<Usuario> buscarPorId(int id);                
    Optional<Usuario> buscarPorEmail(String email);        
    Optional<UsuarioLogin> buscarParaLogin(String email);  
    boolean existePorCpf(String cpf);
    boolean existePorEmail(String email);
    boolean atualizar(Usuario usuario);                    
    boolean desativar(int id);
}