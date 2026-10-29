
package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import java.util.List;

public interface SolicitacaoDao {
    List<SolicitacaoResumo> listarVisiveis(String emailFuncionario);
}
