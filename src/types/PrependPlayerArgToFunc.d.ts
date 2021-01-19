export type PrependPlayerArgToFunc<F> = F extends (...args: infer A) => void
	? (player: Player, ...args: A) => void
	: never;
