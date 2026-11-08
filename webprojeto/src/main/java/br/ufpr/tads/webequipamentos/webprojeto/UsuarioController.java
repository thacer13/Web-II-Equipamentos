package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.services.UsuarioService;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

   
    @PostMapping("/auth/login")
    public UsuarioResponse login(@RequestBody LoginRequest req, HttpSession session) {
        UsuarioResponse usuario = service.login(req);
        
        session.setAttribute("email", usuario.email());
        session.setAttribute("perfil", usuario.perfil());

        return usuario;
    }

    @PostMapping("/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpSession session) {
        session.invalidate();
    }

    
    @PostMapping("/clientes")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@RequestBody CadastroRequest req) {
        return service.cadastrar(req);
    }
}