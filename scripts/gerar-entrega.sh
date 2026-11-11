#!/usr/bin/env bash
# Gera o ZIP de entrega no formato pedido pelo professor (T41):
#
#   <NOME>/
#     integrantes.txt      nome completo, GRR e e-mail
#     Fontes/              código do último commit
#     Documentacao/        README, instruções, suposições, contratos, validação e SQL
#
# Uso: scripts/gerar-entrega.sh NOME_DO_ALUNO1_NOME_DO_ALUNO2
# Saída: entrega/<NOME>.zip
#
# Todo o conteúdo vem do mesmo commit: faça commit antes de gerar.
set -euo pipefail

if [ "$#" -ne 1 ] || [ -z "$1" ]; then
    echo "Uso: scripts/gerar-entrega.sh NOME_DO_ALUNO1_NOME_DO_ALUNO2" >&2
    exit 2
fi

NOME="$1"
case "$NOME" in
    */*|*\\*|.|..|*.zip)
        echo "Erro: informe somente o nome-base do ZIP, sem extensão ou separadores de diretório." >&2
        exit 2
        ;;
esac

RAIZ="$(git rev-parse --show-toplevel)"
SAIDA="$RAIZ/entrega"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$RAIZ"

if git ls-tree -r --name-only HEAD | grep -Eq '(^|/)\.env$'; then
    echo "Erro: há um arquivo .env versionado em HEAD. Remova-o antes de gerar a entrega." >&2
    exit 1
fi

if git ls-tree -r --name-only HEAD | grep -Eq '(^|/)(node_modules|target|dist)/'; then
    echo "Erro: há diretório de dependências ou build versionado em HEAD." >&2
    exit 1
fi

PASTA="$TMP/$NOME"
mkdir -p "$PASTA/Fontes" "$PASTA/Documentacao"

# Fontes e documentos partem do mesmo commit para evitar misturar versões.
git archive HEAD | tar -x -C "$PASTA/Fontes"
SNAPSHOT="$PASTA/Fontes"

if grep -q "PREENCHER" "$SNAPSHOT/docs/integrantes.txt"; then
    echo "Aviso: docs/integrantes.txt ainda tem e-mails a preencher." >&2
fi

# O Compose lê as credenciais do ambiente; verifica que nenhum segredo literal foi commitado.
if grep -rIlE "MAIL_PASS.*[a-z]{16}" "$PASTA/Fontes" --include=*.yml --include=*.properties --include=*.env; then
    echo "Erro: credencial de e-mail encontrada nos fontes. Entrega não gerada." >&2
    exit 1
fi

cp "$SNAPSHOT/docs/integrantes.txt" "$PASTA/integrantes.txt"
sed \
    -e 's|../docs/como-executar.md|./como-executar.md|g' \
    -e 's|../docs/validacao.md|./validacao.md|g' \
    "$SNAPSHOT/app-projeto/README.md" > "$PASTA/Documentacao/README.md"
cp "$SNAPSHOT/docs/como-executar.md" \
   "$SNAPSHOT/docs/conferencia-entrega.md" \
   "$SNAPSHOT/docs/contratos-api.md" \
   "$SNAPSHOT/docs/suposicoes.md" \
   "$SNAPSHOT/docs/validacao.md" \
   "$SNAPSHOT/docs/verificar-integridade.sql" \
   "$PASTA/Documentacao/"

# Suposições em .odt (exigência do professor), convertidas do Markdown pelo LibreOffice
/usr/bin/env python3 - "$SNAPSHOT/docs/suposicoes.md" "$TMP/suposicoes.html" <<'PY'
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
(cd "$TMP" && zip -qr "$TMP/$NOME.zip" "$NOME")
mv -f "$TMP/$NOME.zip" "$SAIDA/$NOME.zip"

echo "Gerado: $SAIDA/$NOME.zip ($(du -h "$SAIDA/$NOME.zip" | cut -f1))"
