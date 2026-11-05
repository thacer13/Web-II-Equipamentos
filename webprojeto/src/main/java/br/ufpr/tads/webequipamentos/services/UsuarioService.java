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

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioDao dao;
    private final SenhaHash senhaHash;

    public UsuarioService(UsuarioDao dao, SenhaHash senhaHash) {
        this.dao = dao;
        this.senhaHash = senhaHash;
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

        // Simulação do envio por e-mail: a senha aparece no console do Spring
        log.info("[SIMULAÇÃO DE E-MAIL] Para: {} | Sua senha é: {}", email, senha);

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

    public UsuarioResponse buscar(Integer id) {
        Usuario u = dao.buscarPorId(id).orElseThrow(NaoEncontradoException::new);
        return new UsuarioResponse(u.id(), u.nome(), u.email(), "CLIENTE");
    }

    @Transactional
    public void excluir(Integer id) {
        if (!dao.excluir(id)) throw new NaoEncontradoException();
    }

    private void validar(CadastroRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Dados não informados.");
        }
        if (!Validacoes.textoEntre(req.nome(), 3, 150)) {
            throw new IllegalArgumentException("Nome inválido.");
        }
        if (!Validacoes.emailValido(req.email())) {
            throw new IllegalArgumentException("E-mail inválido.");
        }
        if (!Validacoes.cpfValido(req.cpf())) {
            throw new IllegalArgumentException("CPF inválido.");
        }

        int digitosTelefone = Validacoes.somenteDigitos(req.telefone()).length();
        if (digitosTelefone < 10 || digitosTelefone > 11) {
            throw new IllegalArgumentException("Telefone inválido.");
        }
        if (Validacoes.somenteDigitos(req.cep()).length() != 8) {
            throw new IllegalArgumentException("CEP inválido.");
        }
        if (!Validacoes.textoEntre(req.logradouro(), 2, 150)) {
            throw new IllegalArgumentException("Logradouro inválido.");
        }
        if (!Validacoes.textoEntre(req.numero(), 1, 10)) {
            throw new IllegalArgumentException("Número inválido.");
        }
        if (!Validacoes.textoEntre(req.bairro(), 2, 100)) {
            throw new IllegalArgumentException("Bairro inválido.");
        }
        if (!Validacoes.textoEntre(req.cidade(), 2, 100)) {
            throw new IllegalArgumentException("Cidade inválida.");
        }
        if (req.estado() == null || !req.estado().trim().toUpperCase().matches("[A-Z]{2}")) {
            throw new IllegalArgumentException("Estado inválido.");
        }
    }
}