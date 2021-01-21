import { ISignalConnection } from "@rbxts/signals-tooling";
import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";
import { PrependPlayerArgToFunc } from "../types/PrependPlayerArgToFunc";

/**
 * Defines the interface for listening to remote signals sent from a client
 */
export interface IClientSignalListener<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Connects to remote signals sent from a client
	 * @param callback The callback function that is used when a signal is received
	 */
	connect(callback: PrependPlayerArgToFunc<T>): ISignalConnection;

	/**
	 * Yields until a signal is received
	 * @returns The player of the client sending the signal and the signal arguments
	 */
	wait(): Parameters<PrependPlayerArgToFunc<T>>;
}
