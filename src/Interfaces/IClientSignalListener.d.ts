import { ISignalConnection } from "@rbxts/signals-tooling";
import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";
import { PrependPlayerArgToFunc } from "../Types/PrependPlayerArgToFunc";

/**
 * Defines the interface for listening to remote signals sent from a client
 */
export interface IClientSignalListener<T extends NetworkedEventCallback = () => void> extends IDestroyable {
	/**
	 * Connects to remote signals sent from a client
	 * @param callback The callback function that is used when a signal is received
	 */
	connect(callback: PrependPlayerArgToFunc<T>): ISignalConnection;

	/**
	 * Yields until a signal is received
	 * @returns The player of the client sending the signal and the signal arguments
	 */
	wait(): FunctionArguments<PrependPlayerArgToFunc<T>>;
}
