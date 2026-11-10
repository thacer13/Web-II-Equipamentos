package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.FuncionarioDao;
import br.ufpr.tads.webequipamentos.dto.FuncionarioRequest;
import br.ufpr.tads.webequipamentos.dto.FuncionarioResponse;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FuncionarioService {

    private final FuncionarioDao dao;
    private final SenhaHash senhaHash;
    private final EmailService emailService;

    public FuncionarioService(FuncionarioDao dao, SenhaHash senhaHash, EmailService emailService) {
        this.dao = dao;
        this.senhaHash = senhaHash;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listar() {
        return dao.listar();
    }

    @Transactional(readOnly = true)
    public FuncionarioResponse buscar(Integer id) {
        return dao.buscarPorId(id).orElseThrow(NaoEncontradoException::new);
    }

    @Transactional
    public FuncionarioResponse cadastrar(FuncionarioRequest request) {
        DadosFuncionario dados = validar(request);
        validarEmailUnico(dados.email(), null);

        String senha = senhaHash.gerarSenhaNumerica();
        String salt = senhaHash.gerarSalt();
        try {
            int id = dao.inserir(
                dados.nome(),
                dados.email(),
                dados.dataNascimento(),
                senhaHash.hash(salt, senha),
                salt
            );
            emailService.enviarSenhaTemporaria(dados.email(), senha);
            return new FuncionarioResponse(
                id,
                dados.nome(),
                dados.email(),
                "FUNCIONARIO",
                dados.dataNascimento(),
                true
            );
        } catch (DuplicateKeyException e) {
            throw new ConflitoException("E-mail já cadastrado.");
        }
    }

    @Transactional
    public FuncionarioResponse atualizar(Integer id, FuncionarioRequest request) {
        FuncionarioResponse atual = buscar(id);
        DadosFuncionario dados = validar(request);
        validarEmailUnico(dados.email(), id);
        try {
            if (!dao.atualizar(id, dados.nome(), dados.email(), dados.dataNascimento())) {
                throw new NaoEncontradoException();
            }
        } catch (DuplicateKeyException e) {
            throw new ConflitoException("E-mail já cadastrado.");
        }
        return new FuncionarioResponse(
            id,
            dados.nome(),
            dados.email(),
            "FUNCIONARIO",
            dados.dataNascimento(),
            atual.ativo()
        );
    }

    @Transactional
    public void desativar(Integer id, Integer idAutenticado, String emailAutenticado) {
        FuncionarioResponse funcionario = buscar(id);
        if (id.equals(idAutenticado)
                || (emailAutenticado != null
                    && funcionario.email().equalsIgnoreCase(emailAutenticado.trim()))) {
            throw new ConflitoException("Não é permitido desativar a si mesmo.");
        }
        List<Integer> ativos = dao.bloquearFuncionariosAtivos();
        if (ativos.size() <= 1) {
            throw new ConflitoException("Não é permitido desativar o último funcionário ativo.");
        }
        if (!dao.desativar(id)) {
            throw new ConflitoException("O funcionário já está desativado.");
        }
    }

    @Transactional
    public void redefinirSenha(Integer id) {
        FuncionarioResponse funcionario = buscar(id);
        String senha = senhaHash.gerarSenhaNumerica();
        String salt = senhaHash.gerarSalt();
        if (!dao.atualizarSenha(id, senhaHash.hash(salt, senha), salt)) {
            throw new NaoEncontradoException();
        }
        emailService.enviarSenhaTemporaria(funcionario.email(), senha);
    }

    private DadosFuncionario validar(FuncionarioRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados do funcionário não informados.");
        }
        String nome = request.nome() == null ? "" : request.nome().trim().replaceAll("\\s+", " ");
        if (!Validacoes.textoEntre(nome, 3, 150)) {
            throw new IllegalArgumentException("Nome inválido.");
        }
        if (!Validacoes.emailValido(request.email())) {
            throw new IllegalArgumentException("E-mail inválido.");
        }
        LocalDate nascimento = request.dataNascimento();
        if (nascimento == null || nascimento.isBefore(LocalDate.of(1950, 1, 1))
                || nascimento.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Data de nascimento inválida.");
        }
        return new DadosFuncionario(nome, request.email().trim().toLowerCase(), nascimento);
    }

    private void validarEmailUnico(String email, Integer ignorarId) {
        if (dao.existePorEmail(email, ignorarId)) {
            throw new ConflitoException("E-mail já cadastrado.");
        }
    }

    private record DadosFuncionario(String nome, String email, LocalDate dataNascimento) {}
}
