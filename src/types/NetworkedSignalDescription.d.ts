import { NetworkedSignalCallback } from "./NetworkedSignalCallback";
import { ArgumentsTupleTypesCheck } from "./ArgumentsTupleTypesCheck";
import {
	ClientSignalListenerMiddlewarePayload,
	ServerSignalListenerMiddlewarePayload,
	MiddlewareFunc,
} from "./MiddlewareTypes";
import { GetNetworkedSignalCallbackType } from "./GetNetworkedSignalCallbackType";

/**
 * Defines the description of a networked signal
 */
export type NetworkedSignalDescription<T extends NetworkedSignalCallback = () => void> = {
	/** The optional set of middleware functions for signals fired from the client */
	readonly clientSignalListenerMiddleware?: ReadonlyArray<MiddlewareFunc<ClientSignalListenerMiddlewarePayload<T>>>;

	/** The name of the signal */
	readonly name: string;

	/** The optional set of middleware functions for signals fired from the server */
	readonly serverSignalListenerMiddleware?: ReadonlyArray<MiddlewareFunc<ServerSignalListenerMiddlewarePayload<T>>>;

	/** The set of type checks to apply to signal arguments */
	readonly typeChecks: ArgumentsTupleTypesCheck<T>;
};
