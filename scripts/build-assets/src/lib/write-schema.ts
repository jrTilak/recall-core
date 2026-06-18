import type { ZodType } from "zod";
import { toJSONSchema } from "zod";
import { writeJsonFile } from "./write-json";

interface WriteSchemaOptions {
	filePath: string;
	schema: ZodType;
	transform?: (jsonSchema: Record<string, unknown>) => Record<string, unknown>;
}

export async function writeSchema({
	filePath,
	schema,
	transform,
}: WriteSchemaOptions): Promise<void> {
	const jsonSchema = toJSONSchema(schema) as Record<string, unknown>;
	await writeJsonFile(filePath, transform ? transform(jsonSchema) : jsonSchema);
}
