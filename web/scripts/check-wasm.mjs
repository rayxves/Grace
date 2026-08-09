import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");
const srcDir = path.join(repoRoot, "grace", "src");
const pkgDir = path.join(repoRoot, "grace", "pkg");

function walk(dir) {
	const files = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walk(full));
		else if (entry.name !== ".gitignore") files.push(full);
	}
	return files;
}

function newestMtime(dir) {
	return Math.max(...walk(dir).map((file) => statSync(file).mtimeMs));
}

function oldestMtime(dir) {
	return Math.min(...walk(dir).map((file) => statSync(file).mtimeMs));
}

const srcMtime = newestMtime(srcDir);
const pkgMtime = oldestMtime(pkgDir);

if (srcMtime > pkgMtime) {
	console.error(
		"grace/pkg parece desatualizado em relação a grace/src.\n" +
			"Rode `cd grace && wasm-pack build --target web` e recomite grace/pkg antes de continuar.",
	);
	process.exit(1);
}

console.log("grace/pkg está em dia com grace/src.");
