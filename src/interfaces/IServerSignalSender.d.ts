import { IDestroyable } from "@rbxts/dumpster";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";

/**
 * Defines the interface for firing remote signals from the server to clients
 */
export interface IServerSignalSender<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Fires a signal from the server to a specified client
	 * @param player The player whose client will receive the signal
	 * @param args The arguments to send with the signal
	 */
	fireToPlayer(player: Player, ...args: Parameters<T>): void;

	/**
	 * Fires a signal from the server to all existing clients
	 * @param args The arguments to send with the signal
	 */
	fireToAll(...args: Parameters<T>): void;

	/**
	 * Fires a signal from the server to a set of clients
	 * @param playersWhitelist The list of players whose clients will receive the signal
	 * @param args The arguments to send with the signal
	 */
	fireToWhitelist(playersWhitelist: ReadonlyArray<Player>, ...args: Parameters<T>): void;

	/**
	 * Fires a signal from the server to all existing clients except those listed
	 * @param playersBlacklist The list of players whose clients will not receive the signal
	 * @param args The arguments to send with the signal
	 */
	fireToOthers(playersBlacklist: ReadonlyArray<Player>, ...args: Parameters<T>): void;
}
