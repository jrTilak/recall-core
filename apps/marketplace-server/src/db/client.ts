import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema/index";

/** Creates a Drizzle client from the Worker D1 binding. */
export function createDb(db: D1Database) {
	return drizzle(db, { schema });
}

export { schema };
