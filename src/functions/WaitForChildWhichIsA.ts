export function waitForChildWhichIsA<T extends keyof Instances>(parent: Instance, className: T): Instances[T] {
	const existing = parent.FindFirstChildWhichIsA(className);
	if (existing !== undefined) {
		return existing;
	}

	while (true) {
		const [newChild] = parent.ChildAdded.Wait();
		if (newChild.IsA(className)) {
			return newChild;
		}
	}
}
