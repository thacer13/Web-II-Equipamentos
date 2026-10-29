
package br.ufpr.tads.webequipamentos.webprojeto;

import br.ufpr.tads.webequipamentos.dao.SolicitacaoDaoImpl;
import br.ufpr.tads.webequipamentos.services.SolicitacaoService;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({SolicitacaoDaoImpl.class, SolicitacaoService.class})
public class SolicitacaoConfig {
}
