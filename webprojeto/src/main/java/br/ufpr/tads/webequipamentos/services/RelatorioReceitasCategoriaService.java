package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.RelatorioReceitasCategoriaDao;
import br.ufpr.tads.webequipamentos.dto.ReceitaCategoria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RelatorioReceitasCategoriaService {

    private final RelatorioReceitasCategoriaDao dao;

    public RelatorioReceitasCategoriaService(RelatorioReceitasCategoriaDao dao) {
        this.dao = dao;
    }

    @Transactional(readOnly = true)
    public List<ReceitaCategoria> listar() {
        return dao.listar();
    }
}
