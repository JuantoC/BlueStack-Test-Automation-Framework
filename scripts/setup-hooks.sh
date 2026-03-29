#!/bin/bash
# Instala los Git hooks del proyecto BlueStack
# Ejecutar una sola vez: bash scripts/setup-hooks.sh

set -e

echo "🔧 Instalando Git hooks..."

# pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npx ts-node scripts/hooks/pre-commit.ts
EOF

# post-commit
cat > .git/hooks/post-commit << 'EOF'
#!/bin/sh
npx ts-node scripts/hooks/post-commit.ts
EOF

chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit

echo "✅ Hooks instalados:"
echo "   · .git/hooks/pre-commit"
echo "   · .git/hooks/post-commit"
echo ""
echo "⚠️  Recordá: los hooks viven en .git/ y no se pushean."
echo "   Cualquier colaborador nuevo debe correr este script."