package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.CategoriaDao;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.CategoriaEquipamento;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaDao dao;

    public CategoriaService(CategoriaDao dao) {
        this.dao = dao;
    }

    @Transactional(readOnly = true)
    public List<CategoriaEquipamento> listar() {
        return dao.listar();
    }

    @Transactional
    public CategoriaEquipamento inserir(String nome) {
        String normalizado = validarNome(nome);
        validarNomeUnico(normalizado, null);
        try {
            int id = dao.inserir(normalizado);
            return dao.buscarPorId(id).orElseThrow(NaoEncontradoException::new);
        } catch (DuplicateKeyException e) {
            throw new ConflitoException("Já existe uma categoria com esse nome.");
        }
    }

    @Transactional
    public CategoriaEquipamento editar(Integer id, String nome) {
        String normalizado = validarNome(nome);
        CategoriaEquipamento atual = dao.buscarPorId(id)
            .orElseThrow(NaoEncontradoException::new);
        validarNomeUnico(normalizado, id);
        try {
            if (!dao.atualizar(id, normalizado)) {
                throw new NaoEncontradoException();
            }
        } catch (DuplicateKeyException e) {
            throw new ConflitoException("Já existe uma categoria com esse nome.");
        }
        return new CategoriaEquipamento(atual.id(), normalizado, atual.ativo());
    }

    @Transactional
    public void desativar(Integer id) {
        if (dao.buscarPorId(id).isEmpty()) {
            throw new NaoEncontradoException();
        }
        if (!dao.desativar(id)) {
            throw new ConflitoException("A categoria já está desativada.");
        }
    }

    private String validarNome(String nome) {
        if (nome == null) {
            throw new IllegalArgumentException("Informe o nome da categoria.");
        }
        String normalizado = nome.trim().replaceAll("\\s+", " ");
        if (normalizado.length() < 2 || normalizado.length() > 100) {
            throw new IllegalArgumentException("O nome deve ter de 2 a 100 caracteres.");
        }
        return normalizado;
    }

    private void validarNomeUnico(String nome, Integer ignorarId) {
        if (dao.existePorNome(nome, ignorarId)) {
            throw new ConflitoException("Já existe uma categoria com esse nome.");
        }
    }
}
