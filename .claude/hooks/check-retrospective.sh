#!/usr/bin/env bash
# .claude/hooks/check-retrospective.sh
# Stop hook: verifica si skill-retrospective fue ejecutada cuando hay archivos .ts/.md editados.
# Si hay cambios sin retrospectiva → exit 1 (fuerza a Claude a responder con el proceso).
# Si ya corrió o no hay cambios → exit 0 (deja pasar).

set -euo pipefail

REPO_DIR="/home/jutoc/proyectos/BlueStack-Test-Automation-Framework"
MARKER="$REPO_DIR/.claude/.retro-marker"

# ── 1. Verificar si hay archivos .ts o .md modificados (staged o unstaged) ──
CHANGED_COUNT=$(git -C "$REPO_DIR" status --short 2>/dev/null \
  | grep -E '\.(ts|md)$' \
  | wc -l || echo 0)

if [ "$CHANGED_COUNT" -eq 0 ]; then
  exit 0
fi

# ── 2. Verificar si skill-retrospective ya corrió después del último cambio ──
if [ -f "$MARKER" ]; then
  MARKER_TIME=$(stat -c %Y "$MARKER" 2>/dev/null || echo 0)
  LATEST_CHANGE=0

  while IFS= read -r line; do
    # Extraer path del archivo (columna 2 en git status --short)
    FILE_PATH=$(echo "$line" | sed 's/^...//')
    FULL_PATH="$REPO_DIR/$FILE_PATH"
    if [ -f "$FULL_PATH" ]; then
      MTIME=$(stat -c %Y "$FULL_PATH" 2>/dev/null || echo 0)
      if [ "$MTIME" -gt "$LATEST_CHANGE" ]; then
        LATEST_CHANGE=$MTIME
      fi
    fi
  done < <(git -C "$REPO_DIR" status --short 2>/dev/null | grep -E '\.(ts|md)$')

  if [ "$MARKER_TIME" -gt "$LATEST_CHANGE" ]; then
    exit 0  # skill-retrospective corrió después del último cambio
  fi
fi

# ── 3. skill-retrospective pendiente → bloquear y notificar ──
cat <<'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  HOOK: skill-retrospective no ejecutada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hay archivos .ts/.md modificados en esta sesión pero
el proceso skill-retrospective no fue registrado.

Ejecutar skill-retrospective ahora (4 lentes: convenciones,
calidad, conocimiento nuevo, sync de docs).
Al finalizar, el hook se resolverá automáticamente.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

exit 1
