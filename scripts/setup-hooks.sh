#!/bin/bash
# Instalar hooks de Git

# Pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npx ts-node scripts/hooks/pre-commit.ts
EOF

# Post-commit
cat > .git/hooks/post-commit << 'EOF'
#!/bin/sh
npx ts-node scripts/hooks/post-commit.ts
EOF

chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
echo "✅ Git hooks instalados correctamente"