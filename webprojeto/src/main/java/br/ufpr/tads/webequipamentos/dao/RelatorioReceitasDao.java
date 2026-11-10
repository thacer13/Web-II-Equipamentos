package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ReceitaDia;

import java.time.LocalDate;
import java.util.List;

public interface RelatorioReceitasDao {
    List<ReceitaDia> listarPorPeriodo(LocalDate inicio, LocalDate fim);
}
