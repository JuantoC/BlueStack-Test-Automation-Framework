#!/usr/bin/env python3
"""
pom-scanner.py — Utilidad para escanear la estructura POM existente del repositorio.

Uso:
  python3 pom-scanner.py scan <ruta_src_pages>    Escanea y muestra la estructura POM actual
  python3 pom-scanner.py check <archivo.ts>        Valida convenciones básicas de un archivo generado
  python3 pom-scanner.py todos <archivo.ts>        Lista todos los TODOs pendientes en un archivo

El agente ejecuta este script, no lo carga en contexto.
"""

import sys
import os
import re
from pathlib import Path


def scan_pom_structure(pages_dir: str) -> None:
    """Escanea src/pages/ y muestra la estructura de clases POM existentes."""
    pages_path = Path(pages_dir)
    if not pages_path.exists():
        print(f"ERROR: Directorio no encontrado: {pages_dir}")
        sys.exit(1)

    print("=" * 60)
    print("ESTRUCTURA POM EXISTENTE")
    print("=" * 60)

    for ts_file in sorted(pages_path.rglob("*.ts")):
        rel_path = ts_file.relative_to(pages_path)
        content = ts_file.read_text(encoding="utf-8", errors="replace")

        # Extraer nombre de clase
        class_match = re.search(r"export\s+class\s+(\w+)", content)
        class_name = class_match.group(1) if class_match else "NO_CLASS"

        # Extraer tipos exportados
        types = re.findall(r"export\s+type\s+(\w+)", content)

        # Extraer métodos públicos
        methods = re.findall(r"async\s+(\w+)\s*\(", content)
        public_methods = [m for m in methods if not m.startswith("_")]

        # Detectar si es Maestro
        is_maestro = "step(" in content and "attachment(" in content

        # Detectar subcomponentes importados
        subcomps = re.findall(r'import\s+\{\s*(\w+)\s*\}\s+from\s+"\./', content)

        # Detectar locators
        locators = re.findall(r"private\s+static\s+readonly\s+(\w+):\s*Locator", content)

        role = "MAESTRO" if is_maestro else "SUBCOMP"

        print(f"\n📄 {rel_path}")
        print(f"   Clase: {class_name} [{role}]")
        if types:
            print(f"   Types: {', '.join(types)}")
        if subcomps:
            print(f"   Importa: {', '.join(subcomps)}")
        if locators:
            print(f"   Locators: {len(locators)} ({', '.join(locators[:5])}{'...' if len(locators) > 5 else ''})")
        if public_methods:
            print(f"   Métodos: {', '.join(public_methods)}")

    print("\n" + "=" * 60)


def check_conventions(file_path: str) -> None:
    """Valida convenciones básicas de un archivo POM generado."""
    path = Path(file_path)
    if not path.exists():
        print(f"ERROR: Archivo no encontrado: {file_path}")
        sys.exit(1)

    content = path.read_text(encoding="utf-8")
    issues = []
    warnings = []

    # Check: import de resolveRetryConfig
    if "resolveRetryConfig" not in content:
        issues.append("FALTA import de resolveRetryConfig")

    # Check: import de logger
    if "import logger" not in content:
        issues.append("FALTA import de logger")

    # Check: import de getErrorMessage
    if "getErrorMessage" not in content:
        issues.append("FALTA import de getErrorMessage")

    # Check: constructor con driver y opts
    if not re.search(r"constructor\s*\(\s*driver:\s*WebDriver\s*,\s*opts:\s*RetryOptions\s*\)", content):
        issues.append("Constructor no sigue el patrón (driver: WebDriver, opts: RetryOptions)")

    # Check: resolveRetryConfig en constructor
    if not re.search(r'resolveRetryConfig\s*\(', content):
        issues.append("FALTA resolveRetryConfig() en constructor")

    # Check: JSDoc en clase
    if not re.search(r'/\*\*[\s\S]*?\*/\s*export\s+class', content):
        issues.append("FALTA JSDoc en la clase")

    # Check: error handling en métodos async
    async_methods = re.findall(r"async\s+(\w+)\s*\([^)]*\)\s*:\s*Promise", content)
    for method in async_methods:
        # Buscar el bloque del método
        method_pattern = rf"async\s+{method}\s*\("
        method_match = re.search(method_pattern, content)
        if method_match:
            # Buscar try/catch después del método
            after_method = content[method_match.start():method_match.start() + 2000]
            if "try {" not in after_method and "try{" not in after_method:
                warnings.append(f"Método '{method}' sin try/catch")

    # Check: locators con UPPER_SNAKE_CASE
    locator_names = re.findall(r"private\s+static\s+readonly\s+(\w+):\s*Locator", content)
    for name in locator_names:
        if name != name.upper():
            issues.append(f"Locator '{name}' no está en UPPER_SNAKE_CASE")

    # Check: TODO placeholders
    todos = re.findall(r'TODO_\w+', content)

    # Check: tipo unknown en catch
    catches = re.findall(r'catch\s*\((\w+)(?::\s*(\w+))?\)', content)
    for var_name, type_name in catches:
        if type_name and type_name != "unknown":
            issues.append(f"catch usa tipo '{type_name}' en vez de 'unknown'")

    # Check: extensión .js en imports
    imports_without_js = re.findall(r'from\s+"[^"]+(?<!\.js)"', content)
    local_imports = [i for i in imports_without_js if '"./' in i or '"../' in i]
    for imp in local_imports:
        issues.append(f"Import local sin extensión .js: {imp}")

    print("=" * 60)
    print(f"VALIDACIÓN: {path.name}")
    print("=" * 60)

    if issues:
        print(f"\n❌ ERRORES ({len(issues)}):")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print("\n✅ Sin errores de convención")

    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"   - {w}")

    if todos:
        print(f"\n📝 TODOs pendientes ({len(todos)}):")
        for todo in todos:
            print(f"   - {todo}")

    print(f"\n📊 Resumen: {len(async_methods)} métodos async, {len(locator_names)} locators, {len(todos)} TODOs")
    print("=" * 60)


def list_todos(file_path: str) -> None:
    """Lista todos los TODOs pendientes con número de línea."""
    path = Path(file_path)
    if not path.exists():
        print(f"ERROR: Archivo no encontrado: {file_path}")
        sys.exit(1)

    content = path.read_text(encoding="utf-8")
    lines = content.split("\n")

    print(f"📝 TODOs en {path.name}:")
    print("-" * 40)

    found = 0
    for i, line in enumerate(lines, 1):
        if "TODO" in line:
            print(f"   Línea {i:>4}: {line.strip()}")
            found += 1

    if found == 0:
        print("   (ninguno)")
    else:
        print(f"\n   Total: {found} TODOs pendientes")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso:")
        print("  python3 pom-scanner.py scan <ruta_src_pages>")
        print("  python3 pom-scanner.py check <archivo.ts>")
        print("  python3 pom-scanner.py todos <archivo.ts>")
        sys.exit(1)

    command = sys.argv[1]
    target = sys.argv[2]

    if command == "scan":
        scan_pom_structure(target)
    elif command == "check":
        check_conventions(target)
    elif command == "todos":
        list_todos(target)
    else:
        print(f"Comando desconocido: {command}")
        sys.exit(1)
