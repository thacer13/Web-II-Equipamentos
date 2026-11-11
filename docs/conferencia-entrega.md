# Conferência da entrega — Desenvolvimento Web II

## Estrutura obrigatória

O arquivo ZIP deve conter uma pasta principal com o nome do sistema.

Dentro dessa pasta devem existir:

- Um arquivo `integrantes.txt`, contendo nome completo, GRR e e-mail dos seis integrantes.
- Uma pasta `Fontes`, contendo o código-fonte do projeto.
- Uma pasta `Documentacao`, contendo os documentos complementares exigidos.

## Documentação

O documento de suposições deve ser entregue em formato `.odt` ou `.doc`.

Também serão incluídos como apoio:

- README do projeto.
- Instruções de execução.
- Contratos da API.
- Registro de validação.
- Checklist de conferência.
- Script SQL de verificação de integridade.
- Suposições em `suposicoes.md` e `suposicoes.odt`.

## Nome do ZIP

O nome deve seguir o formato solicitado pelo professor:

`Nome_do_Aluno1_Nome_do_Aluno2.zip`

Informe o nome-base (sem a extensão `.zip`) ao gerar o arquivo:

```bash
scripts/gerar-entrega.sh "Nome_do_Aluno1_Nome_do_Aluno2"
```

Execute o comando na raiz do repositório, em Bash (por exemplo, WSL), com Git, `tar`, `zip`, `grep`, `sed`, Python 3 e LibreOffice (`soffice`) disponíveis. O arquivo será criado em `entrega/`. Substitua o exemplo pelos nomes exigidos pelo professor e não inclua a extensão `.zip`.

O pacote gerado contém `integrantes.txt` na raiz, a pasta `Fontes/` com o código do commit e a pasta `Documentacao/` com README, instruções, contratos, validação, checklist e arquivos de integridade e suposições.

## Conferências finais

Antes de enviar:

- Verificar os nomes, GRRs e e-mails dos integrantes.
- Confirmar que o ZIP contém a estrutura e os documentos listados acima.
- Não incluir senhas privadas ou arquivos `.env`.
- Não incluir pastas `node_modules`, `target` ou `dist`.
- Verificar se o ZIP pode ser extraído normalmente.
- Conferir o limite de tamanho do Moodle.
- Realizar a entrega pelo Moodle dentro do prazo.

O script usa o `HEAD` do Git como fonte para todo o conteúdo do pacote. Faça commit das alterações que devem entrar na entrega antes de executá-lo; arquivos locais não commitados não serão incluídos.

## Defesa

O tempo previsto é de aproximadamente 15 minutos.

Todos os seis integrantes devem participar da defesa, demonstrando conhecimento sobre a implementação e o funcionamento do sistema.