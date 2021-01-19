import { ISignalConnection } from "@rbxts/signals-tooling";
import { IDestroyable } from "@rbxts/dumpster";
import { GetNetworkedSignalCallbackType } from "../types/GetNetworkedSignalCallbackType";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";
import { NetworkedSignalDescription } from "../types/NetworkedSignalDescription";
import { PrependPlayerArgToFunc } from "../types/PrependPlayerArgToFunc";

/**
 * Defines the interface for listening to remote signals sent from a client
 */
export interface IClientSignalListener<T extends NetworkedSignalCallback | NetworkedSignalDescription = () => void>
	extends IDestroyable {
	/**
	 * Connects to remote signals sent from a client
	 * @param callback The callback function that is used when a signal is received
	 */
	connect(callback: PrependPlayerArgToFunc<GetNetworkedSignalCallbackType<T>>): ISignalConnection;

	/**
	 * Yields until a signal is received
	 * @returns The player of the client sending the signal and the signal arguments
	 */
	wait(): FunctionArguments<PrependPlayerArgToFunc<GetNetworkedSignalCallbackType<T>>>;
}
