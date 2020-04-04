import { check } from "./Check";

export type ArgumentsTupleCheck<T> = T extends () => void
	? Array<check<unknown>>
	: T extends (arg0: infer A0) => void
	? [check<A0>]
	: T extends (arg0: infer A0, arg1: infer A1) => void
	? [check<A0>, check<A1>]
	: T extends (arg0: infer A0, arg1: infer A1, arg2: infer A2) => void
	? [check<A0>, check<A1>, check<A2>]
	: T extends (arg0: infer A0, arg1: infer A1, arg2: infer A2, arg3: infer A3) => void
	? [check<A0>, check<A1>, check<A2>, check<A3>]
	: T extends (arg0: infer A0, arg1: infer A1, arg2: infer A2, arg3: infer A3, arg4: infer A4) => void
	? [check<A0>, check<A1>, check<A2>, check<A3>, check<A4>]
	: T extends (arg0: infer A0, arg1: infer A1, arg2: infer A2, arg3: infer A3, arg4: infer A4, arg5: infer A5) => void
	? [check<A0>, check<A1>, check<A2>, check<A3>, check<A4>, check<A5>]
	: never;
