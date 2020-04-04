import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";

/**
 * Defines the interface for sending remote signals from the client to the server
 */
interface IClientSignalSender<T extends NetworkedEventCallback> extends IDestroyable {
	/**
	 * Fires a signal from the client to the server
	 * @param args The arguments to send with the signal
	 */
	fire(...args: FunctionArguments<T>): void;
}
