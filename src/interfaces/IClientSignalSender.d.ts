import { IDestroyable } from "@rbxts/dumpster";
import { GetNetworkedSignalCallbackType } from "../types/GetNetworkedSignalCallbackType";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";

/**
 * Defines the interface for sending remote signals from the client to the server
 */
export interface IClientSignalSender<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Fires a signal from the client to the server
	 * @param args The arguments to send with the signal
	 */
	fire(...args: Parameters<T>): void;
}
