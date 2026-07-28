export function encodeProgram(source: string): string {
	const bytes = new TextEncoder().encode(source);
	let binary = "";
	bytes.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeProgram(encoded: string): string | null {
	try {
		let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
		while (base64.length % 4 !== 0) base64 += "=";
		const binary = atob(base64);
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		return new TextDecoder().decode(bytes);
	} catch {
		return null;
	}
}
