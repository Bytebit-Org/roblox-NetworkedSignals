export class InstanceFactory {
	public createInstance<T extends keyof CreatableInstances>(className: T, parent?: Instance): StrictInstances[T] {
		return new Instance(className, parent);
	}
}
