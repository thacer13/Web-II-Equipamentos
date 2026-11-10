package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.FuncionarioResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FuncionarioDao {
    List<FuncionarioResponse> listar();
    Optional<FuncionarioResponse> buscarPorId(int id);
    boolean existePorEmail(String email, Integer ignorarId);
    int inserir(String nome, String email, LocalDate dataNascimento, String senhaHash, String salt);
    boolean atualizar(int id, String nome, String email, LocalDate dataNascimento);
    boolean atualizarSenha(int id, String senhaHash, String salt);
    List<Integer> bloquearFuncionariosAtivos();
    boolean desativar(int id);
}
