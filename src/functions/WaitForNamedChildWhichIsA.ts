export function waitForNamedChildWhichIsA<T extends keyof Instances>(
	parent: Instance,
	name: string,
	className: T,
): Instances[T] {
	for (const child of parent.GetChildren()) {
		if (child.Name === name && child.IsA(className)) {
			return child;
		}
	}

	while (true) {
		const [newChild] = parent.ChildAdded.Wait();
		if (newChild.Name === name && newChild.IsA(className)) {
			return newChild;
		}
	}
}
