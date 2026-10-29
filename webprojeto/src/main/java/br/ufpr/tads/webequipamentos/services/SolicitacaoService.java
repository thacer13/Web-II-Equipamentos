
package br.ufpr.tads.webequipamentos.services;

import br.ufpr.tads.webequipamentos.dao.SolicitacaoDao;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
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
}
