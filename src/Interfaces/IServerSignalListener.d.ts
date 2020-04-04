import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";

/**
 * Defines the interface for listening to remote signals sent from the server
 */
export interface IServerSignalListener<T extends NetworkedEventCallback> extends IDestroyable {
	/**
	 * Connects to remote signals sent from the server
	 * @param callback The callback function that is used when a signal is received
	 */
	connect(callback: T): RBXScriptConnection;

	/**
	 * Yields until a signal is received
	 * @returns The signal arguments
	 */
	wait(): FunctionArguments<T>;
}
