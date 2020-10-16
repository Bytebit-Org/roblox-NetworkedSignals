import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";

/**
 * Defines the interface for sending remote signals from the client to the server
 */
interface IClientSignalSender<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Fires a signal from the client to the server
	 * @param args The arguments to send with the signal
	 */
	fire(...args: FunctionArguments<T>): void;
}
