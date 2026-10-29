package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.UsuarioDao;
import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.CredenciaisInvalidasException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.Usuario;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioDao dao;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioDao dao, PasswordEncoder encoder) {
        this.dao = dao;
        this.encoder = encoder;
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest req) {
        String cpf = req.cpf().replaceAll("\\D", "");
        String email = req.email().trim().toLowerCase();

        if (dao.existePorCpf(cpf))     throw new ConflitoException("CPF já cadastrado.");
        if (dao.existePorEmail(email)) throw new ConflitoException("E-mail já cadastrado.");

        Usuario novo = new Usuario(
            null,
            cpf,
            req.nome().trim(),
            email,
            req.telefone().replaceAll("\\D", ""),
            encoder.encode(req.senha()),
            req.cep().replaceAll("\\D", ""),
            req.logradouro().trim(),
            req.numero().trim(),
            req.bairro().trim(),
            req.cidade().trim(),
            req.estado().toUpperCase()
        );

        int id = dao.inserir(novo);
        return new UsuarioResponse(id, novo.nome(), novo.email());
    }

    public UsuarioResponse login(LoginRequest req) {
        Usuario u = dao.buscarPorEmail(req.email().trim().toLowerCase())
            .filter(x -> encoder.matches(req.senha(), x.senhaHash()))
            .orElseThrow(CredenciaisInvalidasException::new);
        return new UsuarioResponse(u.id(), u.nome(), u.email());
    }

    public UsuarioResponse buscar(Integer id) {
        Usuario u = dao.buscarPorId(id).orElseThrow(NaoEncontradoException::new);
        return new UsuarioResponse(u.id(), u.nome(), u.email());
    }

    @Transactional
    public void excluir(Integer id) {
        if (!dao.excluir(id)) throw new NaoEncontradoException();
    }
}