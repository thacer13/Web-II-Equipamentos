package br.ufpr.tads.webequipamentos.dao;

import br.ufpr.tads.webequipamentos.dto.ClienteDaSolicitacao;
import br.ufpr.tads.webequipamentos.dto.HistoricoItem;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoAberta;
import br.ufpr.tads.webequipamentos.dto.SolicitacaoResumo;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SolicitacaoDao {
    List<SolicitacaoResumo> listarVisiveis(String emailFuncionario);

    List<SolicitacaoResumo> listarDoCliente(String emailCliente);

    List<SolicitacaoAberta> listarAbertas();

    Optional<Integer> inserir(String emailCliente, Integer categoriaId,
                              String descricaoEquipamento, String descricaoDefeito);

    void registrarAbertura(Integer solicitacaoId);

    Optional<SolicitacaoResumo> buscarResumo(Integer id);

    Optional<SolicitacaoResumo> buscarDoCliente(Integer id, String emailCliente);

    List<HistoricoItem> listarHistorico(Integer solicitacaoId);

    boolean alterarEstado(Integer id, String estadoAtual, String novoEstado);

    Optional<ClienteDaSolicitacao> buscarClienteDaSolicitacao(Integer solicitacaoId);

    boolean orcar(Integer id, String emailFuncionario, BigDecimal valor);

    void registrarOrcamento(Integer solicitacaoId, String emailFuncionario, BigDecimal valor);

    void registrarTransicaoDoCliente(Integer solicitacaoId, String estadoAnterior, String estadoNovo,
                                     BigDecimal valor, String motivo);
}
