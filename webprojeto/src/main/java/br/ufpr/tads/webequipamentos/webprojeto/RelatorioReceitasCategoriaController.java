package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.ReceitaCategoria;
import br.ufpr.tads.webequipamentos.services.RelatorioReceitasCategoriaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioReceitasCategoriaController {

    private final RelatorioReceitasCategoriaService service;

    public RelatorioReceitasCategoriaController(RelatorioReceitasCategoriaService service) {
        this.service = service;
    }

    @GetMapping("/receitas-categoria")
    public List<ReceitaCategoria> receitasPorCategoria() {
        return service.listar();
    }
}
