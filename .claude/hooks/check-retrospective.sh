#!/usr/bin/env bash
# .claude/hooks/check-retrospective.sh
# Stop hook: verifica si skill-retrospective fue ejecutada cuando hay archivos .ts/.md
# editados DURANTE esta sesión (después del session-marker).
# Archivos pendientes de commit de sesiones anteriores no disparan el hook.

set -euo pipefail

REPO_DIR="/home/jutoc/proyectos/BlueStack-Test-Automation-Framework"
MARKER="$REPO_DIR/.claude/.retro-marker"
SESSION_MARKER="$REPO_DIR/.claude/.session-start"

# ── 0. Crear session-marker si no existe (inicio de sesión) ──
if [ ! -f "$SESSION_MARKER" ]; then
  touch "$SESSION_MARKER"
fi
SESSION_START=$(stat -c %Y "$SESSION_MARKER" 2>/dev/null || echo 0)

# ── 1. Contar archivos .ts/.md modificados DESPUÉS del inicio de sesión ──
RECENT_CHANGES=0

while IFS= read -r line; do
  FILE_PATH=$(echo "$line" | sed 's/^...//')
  FULL_PATH="$REPO_DIR/$FILE_PATH"
  if [ -f "$FULL_PATH" ]; then
    MTIME=$(stat -c %Y "$FULL_PATH" 2>/dev/null || echo 0)
    if [ "$MTIME" -gt "$SESSION_START" ]; then
      RECENT_CHANGES=$((RECENT_CHANGES + 1))
    fi
  fi
done < <(git -C "$REPO_DIR" status --short 2>/dev/null | { grep -E '\.(ts|md)$' || true; })

if [ "$RECENT_CHANGES" -eq 0 ]; then
  exit 0  # no hay cambios de esta sesión
fi

# ── 2. Verificar si skill-retrospective ya corrió después del último cambio de sesión ──
if [ -f "$MARKER" ]; then
  MARKER_TIME=$(stat -c %Y "$MARKER" 2>/dev/null || echo 0)
  LATEST_CHANGE=0

  while IFS= read -r line; do
    FILE_PATH=$(echo "$line" | sed 's/^...//')
    FULL_PATH="$REPO_DIR/$FILE_PATH"
    if [ -f "$FULL_PATH" ]; then
      MTIME=$(stat -c %Y "$FULL_PATH" 2>/dev/null || echo 0)
      if [ "$MTIME" -gt "$SESSION_START" ] && [ "$MTIME" -gt "$LATEST_CHANGE" ]; then
        LATEST_CHANGE=$MTIME
      fi
    fi
  done < <(git -C "$REPO_DIR" status --short 2>/dev/null | { grep -E '\.(ts|md)$' || true; })

  if [ "$MARKER_TIME" -gt "$LATEST_CHANGE" ]; then
    exit 0  # skill-retrospective corrió después del último cambio de sesión
  fi
fi

# ── 3. skill-retrospective pendiente → bloquear y notificar ──
cat <<'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  HOOK: skill-retrospective no ejecutada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hay archivos .ts/.md modificados en ESTA SESIÓN pero
el proceso skill-retrospective no fue registrado.

Ejecutar skill-retrospective ahora (4 lentes: convenciones,
calidad, conocimiento nuevo, sync de docs).
Al finalizar, el hook se resolverá automáticamente.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

exit 1
