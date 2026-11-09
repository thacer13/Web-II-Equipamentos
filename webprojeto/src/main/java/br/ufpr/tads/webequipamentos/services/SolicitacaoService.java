package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.NovaSolicitacaoRequest;
import br.ufpr.tads.webequipamentos.dto.RejeicaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoDetalhe;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoAberta;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.ConflitoException;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
import br.ufpr.tads.webequipamentos.model.EstadoSolicitacao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitacaoService {

    private final SolicitacaoDao dao;

    public SolicitacaoService(SolicitacaoDao dao) {
        this.dao = dao;
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoResumo> listarDoFuncionario(String emailFuncionario) {
        if (emailFuncionario == null || emailFuncionario.isBlank()) {
            throw new IllegalArgumentException("Funcionário não identificado.");
        }

        return dao.listarVisiveis(emailFuncionario.trim());
    }

    // RF011
    @Transactional(readOnly = true)
    public List<SolicitacaoAberta> listarAbertas() {
        return dao.listarAbertas();
    }

    // RF003
    @Transactional(readOnly = true)
    public List<SolicitacaoResumo> listarDoCliente(String emailCliente) {
        if (emailCliente == null || emailCliente.isBlank()) {
            throw new IllegalArgumentException("Cliente não identificado.");
        }

        return dao.listarDoCliente(emailCliente.trim());
    }

    // RF004: data/hora e estado ABERTA são definidos pelo servidor, junto com o primeiro histórico.
    @Transactional
    public SolicitacaoResumo criar(String emailCliente, NovaSolicitacaoRequest req) {
        if (emailCliente == null || emailCliente.isBlank()) {
            throw new IllegalArgumentException("Cliente não identificado.");
        }
        if (req == null) {
            throw new IllegalArgumentException("Dados da solicitação não informados.");
        }

        String equipamento = normalizar(req.descricaoEquipamento());
        String defeito = normalizar(req.descricaoDefeito());

        if (!Validacoes.textoEntre(equipamento, 3, 150)) {
            throw new IllegalArgumentException("Informe o equipamento (3 a 150 caracteres).");
        }
        if (!Validacoes.textoEntre(defeito, 10, 2000)) {
            throw new IllegalArgumentException("Descreva o defeito com 10 a 2000 caracteres.");
        }
        if (req.categoriaId() == null) {
            throw new IllegalArgumentException("Selecione uma categoria.");
        }

        Integer id = dao.inserir(emailCliente.trim(), req.categoriaId(), equipamento, defeito)
            .orElseThrow(() -> new IllegalArgumentException("Categoria inválida ou inativa."));

        dao.registrarAbertura(id);

        return dao.buscarResumo(id).orElseThrow(NaoEncontradoException::new);
    }

    // RF008: solicitação de outro cliente responde como inexistente, sem revelar que existe.
    @Transactional(readOnly = true)
    public SolicitacaoDetalhe detalharDoCliente(String emailCliente, Integer id) {
        if (emailCliente == null || emailCliente.isBlank()) {
            throw new IllegalArgumentException("Cliente não identificado.");
        }

        SolicitacaoResumo s = dao.buscarDoCliente(id, emailCliente.trim())
            .orElseThrow(NaoEncontradoException::new);

        return new SolicitacaoDetalhe(
            s.id(),
            s.dataHora(),
            s.descricaoEquipamento(),
            s.descricaoDefeito(),
            s.categoriaEquipamento(),
            s.estado(),
            s.precoOrcado(),
            dao.listarHistorico(s.id())
        );
    }

    // RF006: ORÇADA → APROVADA; o histórico guarda o valor aprovado.
    @Transactional
    public SolicitacaoResumo aprovar(String emailCliente, Integer id) {
        return transicaoDoCliente(emailCliente, id,
            EstadoSolicitacao.ORCADA, EstadoSolicitacao.APROVADA, null, true);
    }

    // RF007: ORÇADA → REJEITADA com motivo obrigatório.
    @Transactional
    public SolicitacaoResumo rejeitar(String emailCliente, Integer id, RejeicaoRequest req) {
        String motivo = normalizar(req == null ? null : req.motivo());

        if (!Validacoes.textoEntre(motivo, 3, 1000)) {
            throw new IllegalArgumentException("O motivo deve ter entre 3 e 1000 caracteres.");
        }

        return transicaoDoCliente(emailCliente, id,
            EstadoSolicitacao.ORCADA, EstadoSolicitacao.REJEITADA, motivo, false);
    }

    // RF009: REJEITADA → APROVADA, devolvendo o serviço ao fluxo de manutenção.
    @Transactional
    public SolicitacaoResumo resgatar(String emailCliente, Integer id) {
        return transicaoDoCliente(emailCliente, id,
            EstadoSolicitacao.REJEITADA, EstadoSolicitacao.APROVADA, null, false);
    }

    // Solicitação de outro cliente → 404; estado diferente do exigido ou alterado no meio → 409.
    // A origem é explícita porque APROVADA pode vir de ORÇADA (aprovar) ou de REJEITADA (resgatar).
    private SolicitacaoResumo transicaoDoCliente(String emailCliente, Integer id, EstadoSolicitacao origemExigida,
                                                 EstadoSolicitacao destino, String motivo, boolean registrarValor) {
        if (emailCliente == null || emailCliente.isBlank()) {
            throw new IllegalArgumentException("Cliente não identificado.");
        }

        SolicitacaoResumo atual = dao.buscarDoCliente(id, emailCliente.trim())
            .orElseThrow(NaoEncontradoException::new);

        EstadoSolicitacao origem = EstadoSolicitacao.doBanco(atual.estado());

        if (origem != origemExigida) {
            throw new ConflitoException(
                "Solicitação em " + origem.valorBanco() + " não permite esta ação."
            );
        }
        origem.validarTransicao(destino);

        if (!dao.alterarEstado(id, origem.valorBanco(), destino.valorBanco())) {
            throw new ConflitoException("A solicitação foi alterada por outro usuário. Atualize a página.");
        }

        dao.registrarTransicaoDoCliente(
            id,
            origem.valorBanco(),
            destino.valorBanco(),
            registrarValor ? atual.precoOrcado() : null,
            motivo
        );

        return dao.buscarResumo(id).orElseThrow(NaoEncontradoException::new);
    }

    private static String normalizar(String texto) {
        return texto == null ? "" : texto.trim().replaceAll("\\s+", " ");
    }
}
