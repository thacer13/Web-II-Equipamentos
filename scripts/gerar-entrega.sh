#!/usr/bin/env bash
# Gera o ZIP de entrega no formato pedido pelo professor (T41):
#
#   <NOME>/
#     integrantes.txt      nome completo, GRR e e-mail
#     Fontes/              código do último commit (sem node_modules, target nem credenciais)
#     Documentacao/        instruções, suposições (.odt), contratos da API, verificação do banco
#
# Uso: scripts/gerar-entrega.sh [NOME]   (padrão: ManutencaoEquipamentos)
# Saída: entrega/<NOME>.zip
#
# Só entra o que está commitado: faça commit antes de gerar.
set -euo pipefail

NOME="${1:-ManutencaoEquipamentos}"
RAIZ="$(git rev-parse --show-toplevel)"
SAIDA="$RAIZ/entrega"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$RAIZ"

if grep -q "PREENCHER" docs/integrantes.txt; then
    echo "Aviso: docs/integrantes.txt ainda tem e-mails a preencher." >&2
fi

PASTA="$TMP/$NOME"
mkdir -p "$PASTA/Fontes" "$PASTA/Documentacao"

# Fontes: exatamente o que está no último commit (git archive ignora node_modules, target etc.)
git archive HEAD | tar -x -C "$PASTA/Fontes"

# Sem credenciais: a senha do e-mail é configurada por variável de ambiente (docs/como-executar.md)
sed -i -E 's/^([[:space:]]*MAIL_PASS:).*/\1 "" # configure a senha de app do Gmail/' \
    "$PASTA/Fontes/docker-compose.yml"
sed -i -E 's/^([[:space:]]*MAIL_USER:).*/\1 "" # configure o e-mail remetente/' \
    "$PASTA/Fontes/docker-compose.yml"

# Confere se nenhuma senha de app do Gmail (16 letras minúsculas) ficou nos arquivos de configuração
if grep -rIEn "MAIL_PASS.*[a-z]{16}" "$PASTA/Fontes" --include=*.yml --include=*.properties --include=*.env; then
    echo "Erro: credencial de e-mail encontrada nos fontes. Entrega não gerada." >&2
    exit 1
fi

cp docs/integrantes.txt "$PASTA/integrantes.txt"
cp docs/como-executar.md docs/contratos-api.md docs/verificar-integridade.sql "$PASTA/Documentacao/"

# Suposições em .odt (exigência do professor), convertidas do Markdown pelo LibreOffice
/usr/bin/env python3 - "$RAIZ/docs/suposicoes.md" "$TMP/suposicoes.html" <<'PY'
import html, re, sys
linhas = open(sys.argv[1], encoding="utf-8").read().splitlines()
saida, item, em_lista = [], [], False

def inline(t):
    t = html.escape(t)
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", t)

def fecha_item():
    global item
    if item:
        saida.append("<li>" + inline(" ".join(item)) + "</li>")
        item = []

for l in linhas + [""]:
    if l.startswith("- "):
        fecha_item()
        if not em_lista:
            saida.append("<ul>"); em_lista = True
        item = [l[2:].strip()]
    elif l.startswith("  ") and item:
        item.append(l.strip())
    else:
        fecha_item()
        if em_lista:
            saida.append("</ul>"); em_lista = False
        m = re.match(r"(#+) (.*)", l)
        if m:
            n = len(m.group(1))
            saida.append(f"<h{n}>{inline(m.group(2))}</h{n}>")
        elif l.strip():
            saida.append(f"<p>{inline(l.strip())}</p>")

open(sys.argv[2], "w", encoding="utf-8").write(
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Suposições</title></head><body>'
    + "\n".join(saida) + "</body></html>")
PY
soffice --headless --convert-to odt:writer8 --outdir "$TMP" "$TMP/suposicoes.html" >/dev/null 2>&1
mv "$TMP/suposicoes.odt" "$PASTA/Documentacao/suposicoes.odt"

mkdir -p "$SAIDA"
rm -f "$SAIDA/$NOME.zip"
(cd "$TMP" && zip -qr "$SAIDA/$NOME.zip" "$NOME")

echo "Gerado: $SAIDA/$NOME.zip ($(du -h "$SAIDA/$NOME.zip" | cut -f1))"
