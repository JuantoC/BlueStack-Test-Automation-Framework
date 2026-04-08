// scripts/skills/jsdoc-scanner.ts
//
// Escanea uno o más archivos TypeScript y reporta gaps de JSDoc en funciones,
// métodos públicos y clases exportadas. Output: JSON array a stdout.
//
// Uso:
//   tsx scripts/skills/jsdoc-scanner.ts --path src/pages/post_page/
//   tsx scripts/skills/jsdoc-scanner.ts --path src/core/wrappers/retry.ts
//   tsx scripts/skills/jsdoc-scanner.ts --path src/pages/ --recursive
//
// Exit 0 siempre — es un scanner, no un validator.

import { Project, Scope } from "ts-morph";
import * as fs from "fs";
import { glob } from "glob";

interface JsDocGap {
  file: string;
  line: number;
  name: string;
  kind: "function" | "method" | "class";
  exported: boolean;
  hasJsDoc: boolean;
  missingDescription: boolean;
  missingParams: string[];
  missingReturns: boolean;
}

function parseArgs(): { targetPath: string; recursive: boolean } {
  const args = process.argv.slice(2);
  const pathIdx = args.indexOf("--path");
  if (pathIdx === -1 || !args[pathIdx + 1]) {
    process.stderr.write(
      "Uso: tsx scripts/skills/jsdoc-scanner.ts --path <archivo-o-directorio> [--recursive]\n"
    );
    process.exit(1);
  }
  return {
    targetPath: args[pathIdx + 1],
    recursive: args.includes("--recursive"),
  };
}

async function resolveFiles(targetPath: string, recursive: boolean): Promise<string[]> {
  if (!fs.existsSync(targetPath)) {
    process.stderr.write(`Path no encontrado: ${targetPath}\n`);
    process.exit(1);
  }
  if (fs.statSync(targetPath).isFile()) {
    return [targetPath];
  }
  const pattern = recursive ? `${targetPath}/**/*.ts` : `${targetPath}/*.ts`;
  const files = await glob(pattern, { ignore: ["node_modules/**"] });
  return files.filter((f) => !f.endsWith(".d.ts") && !f.endsWith(".test.ts"));
}

function isVoidLike(returnTypeText: string): boolean {
  return (
    returnTypeText === "void" ||
    returnTypeText === "Promise<void>" ||
    returnTypeText === ""
  );
}

function extractDocParamNames(tagText: string): string {
  const m = tagText.match(/@param\s+(?:\{[^}]+\}\s+)?(\w+)/);
  return m ? m[1] : "";
}

async function main(): Promise<void> {
  const { targetPath, recursive } = parseArgs();
  const files = await resolveFiles(targetPath, recursive);

  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const gaps: JsDocGap[] = [];

  for (const filePath of files) {
    const sourceFile = project.addSourceFileAtPath(filePath);

    // Funciones standalone exportadas
    for (const fn of sourceFile.getFunctions()) {
      if (!fn.isExported()) continue;

      const jsDocs = fn.getJsDocs();
      const params = fn.getParameters().map((p) => p.getName()).filter((n) => n !== "this");
      const returnTypeText = fn.getReturnTypeNode()?.getText() ?? "void";
      const line = fn.getStartLineNumber();
      const name = fn.getName() ?? "(anonymous)";

      if (jsDocs.length === 0) {
        gaps.push({
          file: filePath,
          line,
          name,
          kind: "function",
          exported: true,
          hasJsDoc: false,
          missingDescription: true,
          missingParams: params,
          missingReturns: !isVoidLike(returnTypeText),
        });
        continue;
      }

      const doc = jsDocs[0];
      const description = doc.getDescription().trim();
      const tags = doc.getTags();
      const docParamNames = tags
        .filter((t) => t.getTagName() === "param")
        .map((t) => extractDocParamNames(t.getText()))
        .filter(Boolean);
      const hasReturns = tags.some((t) => ["returns", "return"].includes(t.getTagName()));
      const missingParams = params.filter((p) => !docParamNames.includes(p));
      const missingReturns = !isVoidLike(returnTypeText) && !hasReturns;

      if (description.length === 0 || missingParams.length > 0 || missingReturns) {
        gaps.push({
          file: filePath,
          line,
          name,
          kind: "function",
          exported: true,
          hasJsDoc: true,
          missingDescription: description.length === 0,
          missingParams,
          missingReturns,
        });
      }
    }

    // Clases y sus métodos públicos
    for (const cls of sourceFile.getClasses()) {
      const isExported = cls.isExported();
      const clsName = cls.getName() ?? "(anonymous)";
      const clsLine = cls.getStartLineNumber();
      const clsJsDocs = cls.getJsDocs();
      const clsMissingDesc =
        clsJsDocs.length === 0 || clsJsDocs[0].getDescription().trim().length === 0;

      if (clsMissingDesc) {
        gaps.push({
          file: filePath,
          line: clsLine,
          name: clsName,
          kind: "class",
          exported: isExported,
          hasJsDoc: clsJsDocs.length > 0,
          missingDescription: true,
          missingParams: [],
          missingReturns: false,
        });
      }

      for (const method of cls.getMethods()) {
        const scope = method.getScope();
        if (scope === Scope.Private || scope === Scope.Protected) continue;
        if (method.getName() === "constructor") continue;

        const jsDocs = method.getJsDocs();
        const params = method
          .getParameters()
          .map((p) => p.getName())
          .filter((n) => n !== "this");
        const returnTypeText = method.getReturnTypeNode()?.getText() ?? "void";
        const line = method.getStartLineNumber();
        const name = method.getName();

        if (jsDocs.length === 0) {
          gaps.push({
            file: filePath,
            line,
            name,
            kind: "method",
            exported: isExported,
            hasJsDoc: false,
            missingDescription: true,
            missingParams: params,
            missingReturns: !isVoidLike(returnTypeText),
          });
          continue;
        }

        const doc = jsDocs[0];
        const description = doc.getDescription().trim();
        const tags = doc.getTags();
        const docParamNames = tags
          .filter((t) => t.getTagName() === "param")
          .map((t) => extractDocParamNames(t.getText()))
          .filter(Boolean);
        const hasReturns = tags.some((t) => ["returns", "return"].includes(t.getTagName()));
        const missingParams = params.filter((p) => !docParamNames.includes(p));
        const missingReturns = !isVoidLike(returnTypeText) && !hasReturns;

        if (description.length === 0 || missingParams.length > 0 || missingReturns) {
          gaps.push({
            file: filePath,
            line,
            name,
            kind: "method",
            exported: isExported,
            hasJsDoc: true,
            missingDescription: description.length === 0,
            missingParams,
            missingReturns,
          });
        }
      }
    }
  }

  process.stdout.write(JSON.stringify(gaps, null, 2) + "\n");
}

main();
