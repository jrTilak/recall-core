export interface BuildTask {
	name: string;
	run: () => Promise<void>;
}

export async function runTasks(tasks: readonly BuildTask[]): Promise<void> {
	const results = await Promise.allSettled(
		tasks.map(async ({ name, run }) => {
			await run();
			console.log(`Built ${name}`);
		}),
	);

	const errors: Error[] = [];

	for (const [index, result] of results.entries()) {
		if (result.status === "fulfilled") continue;

		const task = tasks[index];
		if (!task) {
			throw new Error(`Missing task metadata for result at index ${index}`);
		}

		const cause =
			result.reason instanceof Error
				? result.reason
				: new Error(String(result.reason));
		const error = new Error(`Failed to build ${task.name}: ${cause.message}`, {
			cause,
		});

		console.error(error.message);
		errors.push(error);
	}

	if (errors.length > 0) {
		throw new AggregateError(errors, `${errors.length} build task(s) failed`);
	}
}
