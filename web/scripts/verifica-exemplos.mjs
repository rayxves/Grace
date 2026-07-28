import { build } from "esbuild";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");

const CONTENT_MODULES = [{ file: "src/content/galeria.ts", exportName: "galeria" }];

async function loadContentModule(relPath) {
	const entry = path.join(webRoot, relPath);
	const outdir = mkdtempSync(path.join(tmpdir(), "grace-content-"));
	const outfile = path.join(outdir, "bundle.mjs");
	await build({
		entryPoints: [entry],
		bundle: true,
		format: "esm",
		platform: "node",
		outfile,
		logLevel: "silent",
	});
	return import(pathToFileURL(outfile).href);
}

const { initSync, executar } = await import(
	pathToFileURL(path.join(repoRoot, "grace/pkg/Grace.js")).href
);
initSync({ module: readFileSync(path.join(repoRoot, "grace/pkg/Grace_bg.wasm")) });

function run(source) {
	return JSON.parse(executar(source));
}

function collectOutput(trace) {
	const lines = [];
	for (let i = 1; i < trace.steps.length; i++) {
		if (trace.steps[i].instruction === "imprime") {
			lines.push(trace.steps[i - 1].stack.at(-1));
		}
	}
	return lines;
}

function flattenExamples(items, file) {
	const flat = [];
	for (const item of items) {
		if (Array.isArray(item.examples)) {
			for (const example of item.examples) {
				flat.push({ label: `${file}#${item.id}/${example.id}`, example });
			}
		} else {
			flat.push({ label: `${file}#${item.id}`, example: item });
		}
	}
	return flat;
}

let total = 0;
let failures = 0;

for (const { file, exportName } of CONTENT_MODULES) {
	const mod = await loadContentModule(file);
	const items = mod[exportName];
	if (!Array.isArray(items)) {
		console.error(`FAIL: ${file} não exporta um array em "${exportName}"`);
		failures++;
		continue;
	}

	for (const { label, example } of flattenExamples(items, file)) {
		total++;
		const trace = run(example.code);

		if (example.expect.kind === "error") {
			if (trace.error !== null) {
				console.log(`OK: ${label} (erro esperado: ${trace.error})`);
			} else {
				console.error(`FAIL: ${label} deveria dar erro, mas rodou sem erro`);
				failures++;
			}
			continue;
		}

		if (trace.error !== null) {
			console.error(`FAIL: ${label} deu erro inesperado: ${trace.error}`);
			failures++;
			continue;
		}

		const actual = collectOutput(trace);
		const expected = example.expect.lines;
		if (JSON.stringify(actual) === JSON.stringify(expected)) {
			console.log(`OK: ${label} -> ${JSON.stringify(actual)}`);
		} else {
			console.error(
				`FAIL: ${label} -> esperado ${JSON.stringify(expected)}, obtido ${JSON.stringify(actual)}`,
			);
			failures++;
		}
	}
}

console.log(`\n${total - failures}/${total} exemplos verificados com sucesso`);
if (failures > 0) {
	console.error(`${failures} exemplo(s) falharam a verificação.`);
	process.exit(1);
}
