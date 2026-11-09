package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.NovaSolicitacaoRequest;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import br.ufpr.tads.webequipamentos.exception.NaoEncontradoException;
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

    private static String normalizar(String texto) {
        return texto == null ? "" : texto.trim().replaceAll("\\s+", " ");
    }
}
