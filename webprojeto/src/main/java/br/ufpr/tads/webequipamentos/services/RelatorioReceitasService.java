package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.RelatorioReceitasDao;
import br.ufpr.tads.webequipamentos.dto.ReceitaDia;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RelatorioReceitasService {

    private final RelatorioReceitasDao dao;

    public RelatorioReceitasService(RelatorioReceitasDao dao) {
        this.dao = dao;
    }

    @Transactional(readOnly = true)
    public List<ReceitaDia> listar(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser maior que a data final.");
        }
        return dao.listarPorPeriodo(inicio, fim);
    }
}
