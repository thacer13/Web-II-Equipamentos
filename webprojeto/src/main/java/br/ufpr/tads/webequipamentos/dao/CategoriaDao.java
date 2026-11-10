package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.model.CategoriaEquipamento;

import java.util.List;
import java.util.Optional;

public interface CategoriaDao {
    List<CategoriaEquipamento> listar();
    Optional<CategoriaEquipamento> buscarPorId(int id);
    boolean existePorNome(String nome, Integer ignorarId);
    int inserir(String nome);
    boolean atualizar(int id, String nome);
    boolean desativar(int id);
}
