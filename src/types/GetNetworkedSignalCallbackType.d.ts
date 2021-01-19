import { SignalListenerMiddlewarePayload } from "./MiddlewareTypes";
import { NetworkedSignalCallback } from "./NetworkedSignalCallback";
import { NetworkedSignalDescription } from "./NetworkedSignalDescription";

export type GetNetworkedSignalCallbackType<T> = T extends NetworkedSignalCallback
	? T
	: T extends NetworkedSignalDescription<infer U>
	? U extends NetworkedSignalCallback
		? U
		: never
	: never;
