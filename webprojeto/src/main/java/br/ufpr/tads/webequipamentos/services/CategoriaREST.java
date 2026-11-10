package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.model.CategoriaEquipamento;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaREST {

    private final CategoriaService service;

    public CategoriaREST(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoriaEquipamento> listar() {
        return service.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaEquipamento inserir(@RequestBody CategoriaRequest request) {
        return service.inserir(request == null ? null : request.nome());
    }

    @PutMapping("/{id}")
    public CategoriaEquipamento editar(
            @PathVariable Integer id,
            @RequestBody CategoriaRequest request) {
        return service.editar(id, request == null ? null : request.nome());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Integer id) {
        service.desativar(id);
    }

    public record CategoriaRequest(String nome) {}
}
