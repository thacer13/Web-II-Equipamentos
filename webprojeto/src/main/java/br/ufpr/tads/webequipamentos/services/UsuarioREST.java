package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;

import jakarta.servlet.http.HttpSession;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioREST {

    private final UsuarioService service;

    public UsuarioREST(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponse> obterTodosUsuarios() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obterUsuarioPorId(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse inserir(@RequestBody CadastroRequest request) {
        return service.cadastrar(request);
    }

    @PostMapping("/login")
    public UsuarioResponse login(
        @RequestBody LoginRequest request,
        HttpSession session
    ) {
        UsuarioResponse usuario = service.login(request);
        session.setAttribute("email", usuario.email());
        session.setAttribute("perfil", usuario.perfil());
        return usuario;
    }

    @PutMapping("/{id}")
    public UsuarioResponse alterar(
        @PathVariable Integer id,
        @RequestBody CadastroRequest request
    ) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Integer id) {
        service.excluir(id);
    }
}
