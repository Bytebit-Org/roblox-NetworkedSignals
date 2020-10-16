import { NetworkedSignalCallback } from "./NetworkedSignalCallback";

export type SignalListenerMiddlewarePayload<T extends NetworkedSignalCallback> = {
	readonly args: FunctionArguments<T>;
	readonly signalName: string;
};

export type ClientSignalListenerMiddlewarePayload<T extends NetworkedSignalCallback> = SignalListenerMiddlewarePayload<
	T
> & {
	readonly sourcePlayer: Player;
};

export type ServerSignalListenerMiddlewarePayload<T extends NetworkedSignalCallback> = SignalListenerMiddlewarePayload<
	T
>;

/**
 * A function, synchronous or asynchronous, that returns true if the handling of the signal can continue and false otherwise
 */
export type MiddlewareFunc<T extends SignalListenerMiddlewarePayload<NetworkedSignalCallback>> =
	| ((payload: T) => boolean)
	| ((payload: T) => Promise<boolean>);
