import { TypeCheck } from "./TypeCheck";

export type ArgumentsTupleTypesCheck<T> = T extends (...args: infer As) => void
	? { [k in keyof As]: TypeCheck<As[k]> }
	: never;
