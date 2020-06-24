import { check } from "./Check";

export type ArgumentsTupleCheck<T> = T extends (...args: infer As) => void ? { [k in keyof As]: check<As[k]> } : never;
