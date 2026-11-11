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

    Optional<SolicitacaoResumo> buscarVisivelAoFuncionario(Integer id, String emailFuncionario);

    List<SolicitacaoResumo> listarDoCliente(String emailCliente);

    List<SolicitacaoAberta> listarAbertas();

    Optional<Integer> inserir(String emailCliente, Integer categoriaId,
                              String descricaoEquipamento, String descricaoDefeito);

    int registrarAbertura(Integer solicitacaoId);

    Optional<SolicitacaoResumo> buscarResumo(Integer id);

    Optional<SolicitacaoResumo> buscarDoCliente(Integer id, String emailCliente);

    List<HistoricoItem> listarHistorico(Integer solicitacaoId);

    boolean alterarEstado(Integer id, String estadoAtual, String novoEstado);

    Optional<ClienteDaSolicitacao> buscarClienteDaSolicitacao(Integer solicitacaoId);

    boolean orcar(Integer id, String emailFuncionario, BigDecimal valor);

    int registrarOrcamento(Integer solicitacaoId, String emailFuncionario);

    boolean registrarManutencao(Integer id, String emailFuncionario, String estadoAnterior,
                                String descricaoManutencao, String orientacoesCliente);

    boolean redirecionar(Integer id, String emailFuncionario, String estadoAnterior,
                         Integer funcionarioDestinoId);

    int registrarTransicaoDoCliente(Integer solicitacaoId, String estadoAnterior, String estadoNovo,
                                     BigDecimal valor, String motivo);
}
