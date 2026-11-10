package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.UsuarioDao;
import br.ufpr.tads.webequipamentos.dto.CadastroRequest;
import br.ufpr.tads.webequipamentos.dto.LoginRequest;
import br.ufpr.tads.webequipamentos.dto.UsuarioResponse;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.CredenciaisInvalidasException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.Usuario;
import br.ufpr.tads.webequipamentos.model.UsuarioLogin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioDao dao;
    private final SenhaHash senhaHash;
    private final EmailService emailService;

    public UsuarioService(UsuarioDao dao, SenhaHash senhaHash, EmailService emailService) {
        this.dao = dao;
        this.senhaHash = senhaHash;
        this.emailService = emailService;
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest req) {
        validar(req);

        String cpf = Validacoes.somenteDigitos(req.cpf());
        String email = req.email().trim().toLowerCase();

        if (dao.existePorCpf(cpf))     throw new ConflitoException("CPF já cadastrado.");
        if (dao.existePorEmail(email)) throw new ConflitoException("E-mail já cadastrado.");

        // RF001: senha aleatória de 4 números, guardada com SHA-256 + salt
        String senha = senhaHash.gerarSenhaNumerica();
        String salt = senhaHash.gerarSalt();

        Usuario novo = new Usuario(
            null,
            cpf,
            req.nome().trim(),
            email,
            Validacoes.somenteDigitos(req.telefone()),
            senhaHash.hash(salt, senha),
            salt,
            Validacoes.somenteDigitos(req.cep()),
            req.logradouro().trim(),
            req.numero().trim(),
            req.bairro().trim(),
            req.cidade().trim(),
            req.estado().trim().toUpperCase()
        );

        int id = dao.inserir(novo);

        emailService.enviarEmailCadastro(email, senha);

        return new UsuarioResponse(id, novo.nome(), novo.email(), "CLIENTE");
    }

    public UsuarioResponse login(LoginRequest req) {
        if (req == null || req.email() == null || req.senha() == null) {
            throw new CredenciaisInvalidasException();
        }

        UsuarioLogin u = dao.buscarParaLogin(req.email().trim().toLowerCase())
            .filter(x -> !"SEM_PERFIL".equals(x.perfil()))
            .filter(x -> senhaHash.confere(req.senha(), x.salt(), x.senhaHash()))
            .orElseThrow(CredenciaisInvalidasException::new);

        return new UsuarioResponse(u.id(), u.nome(), u.email(), u.perfil());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarAutenticado(String email) {
        return dao.buscarParaLogin(email.trim().toLowerCase())
            .filter(u -> !"SEM_PERFIL".equals(u.perfil()))
            .map(u -> new UsuarioResponse(u.id(), u.nome(), u.email(), u.perfil()))
            .orElseThrow(NaoEncontradoException::new);
    }

    public UsuarioResponse buscar(Integer id) {
        Usuario u = dao.buscarPorId(id).orElseThrow(NaoEncontradoException::new);
        return new UsuarioResponse(u.id(), u.nome(), u.email(), "CLIENTE");
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return dao.listar().stream()
            .map(u -> new UsuarioResponse(u.id(), u.nome(), u.email(), "CLIENTE"))
            .toList();
    }

    @Transactional
    public UsuarioResponse atualizar(Integer id, CadastroRequest req) {
        validar(req);

        Usuario atual = dao.buscarPorId(id).orElseThrow(NaoEncontradoException::new);
        String cpf = Validacoes.somenteDigitos(req.cpf());
        String email = req.email().trim().toLowerCase();

        if (!cpf.equals(atual.cpf()) && dao.existePorCpf(cpf)) {
            throw new ConflitoException("CPF já cadastrado.");
        }
        if (!email.equals(atual.email()) && dao.existePorEmail(email)) {
            throw new ConflitoException("E-mail já cadastrado.");
        }

        Usuario alterado = new Usuario(
            id,
            cpf,
            req.nome().trim(),
            email,
            Validacoes.somenteDigitos(req.telefone()),
            atual.senhaHash(),
            atual.salt(),
            Validacoes.somenteDigitos(req.cep()),
            req.logradouro().trim(),
            req.numero().trim(),
            req.bairro().trim(),
            req.cidade().trim(),
            req.estado().trim().toUpperCase()
        );

        if (!dao.atualizar(alterado)) {
            throw new NaoEncontradoException();
        }
        return new UsuarioResponse(id, alterado.nome(), alterado.email(), "CLIENTE");
    }

    @Transactional
    public void excluir(Integer id) {
        if (!dao.excluir(id)) throw new NaoEncontradoException();
    }

    private void validar(CadastroRequest req) {
        if (req == null) {
            log.error("CadastroRequest veio nulo!");
            throw new IllegalArgumentException("Dados não informados.");
        }
        if (!Validacoes.textoEntre(req.nome(), 3, 150)) {
            log.error("Nome inválido recebido: '{}'", req.nome());
            throw new IllegalArgumentException("Nome inválido.");
        }
        if (!Validacoes.emailValido(req.email())) {
            log.error("E-mail inválido recebido: '{}'", req.email());
            throw new IllegalArgumentException("E-mail inválido.");
        }
        if (!Validacoes.cpfValido(req.cpf())) {
            log.error("CPF inválido recebido: '{}'", req.cpf());
            throw new IllegalArgumentException("CPF inválido.");
        }

        int digitosTelefone = Validacoes.somenteDigitos(req.telefone()).length();
        if (digitosTelefone < 10 || digitosTelefone > 11) {
            log.error("Telefone inválido recebido: '{}'", req.telefone());
            throw new IllegalArgumentException("Telefone inválido.");
        }
        if (Validacoes.somenteDigitos(req.cep()).length() != 8) {
            log.error("CEP inválido recebido: '{}'", req.cep());
            throw new IllegalArgumentException("CEP inválido.");
        }
        if (!Validacoes.textoEntre(req.logradouro(), 2, 150)) {
            log.error("Logradouro inválido recebido: '{}'", req.logradouro());
            throw new IllegalArgumentException("Logradouro inválido.");
        }
        if (!Validacoes.textoEntre(req.numero(), 1, 10)) {
            log.error("Número inválido recebido: '{}'", req.numero());
            throw new IllegalArgumentException("Número inválido.");
        }
        if (!Validacoes.textoEntre(req.bairro(), 2, 100)) {
            log.error("Bairro inválido recebido: '{}'", req.bairro());
            throw new IllegalArgumentException("Bairro inválido.");
        }
        if (!Validacoes.textoEntre(req.cidade(), 2, 100)) {
            log.error("Cidade inválida recebida: '{}'", req.cidade());
            throw new IllegalArgumentException("Cidade inválida.");
        }
        if (req.estado() == null || !req.estado().trim().toUpperCase().matches("[A-Z]{2}")) {
            log.error("Estado inválido recebido: '{}'", req.estado());
            throw new IllegalArgumentException("Estado inválido.");
        }
    }
}