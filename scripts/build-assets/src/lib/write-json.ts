import { mkdir } from "node:fs/promises";
import path from "node:path";

export async function writeJsonFile(
	filePath: string,
	value: object,
): Promise<void> {
	if (Object.keys(value).length === 0) {
		throw new Error(`Refusing to write an empty object to ${filePath}`);
	}

	let content: string;
	try {
		content = `${JSON.stringify(value, null, 2)}\n`;
	} catch (error) {
		throw new Error(
			`Failed to serialize JSON for ${filePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	await mkdir(path.dirname(filePath), { recursive: true });

	const bytesWritten = await Bun.write(filePath, content);
	if (bytesWritten === 0) {
		throw new Error(`Zero bytes written to ${filePath}`);
	}
}
