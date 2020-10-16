import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";

/**
 * Defines the interface for listening to remote signals sent from the server
 */
export interface IServerSignalListener<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
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
