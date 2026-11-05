package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.model.Usuario;
import br.ufpr.tads.webequipamentos.model.UsuarioLogin;

import java.util.Optional;

public interface UsuarioDao {

    int inserir(Usuario usuario);                         
    Optional<Usuario> buscarPorId(int id);                
    Optional<Usuario> buscarPorEmail(String email);        
    Optional<UsuarioLogin> buscarParaLogin(String email);  
    boolean existePorCpf(String cpf);
    boolean existePorEmail(String email);
    boolean atualizar(Usuario usuario);                    
    boolean excluir(int id);                               
}