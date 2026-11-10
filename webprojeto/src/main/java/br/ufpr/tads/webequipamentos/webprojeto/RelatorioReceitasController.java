package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.ReceitaDia;
import br.ufpr.tads.webequipamentos.services.RelatorioReceitasService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioReceitasController {

    private final RelatorioReceitasService service;

    public RelatorioReceitasController(RelatorioReceitasService service) {
        this.service = service;
    }

    @GetMapping("/receitas")
    public List<ReceitaDia> receitas(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.listar(inicio, fim);
    }
}
