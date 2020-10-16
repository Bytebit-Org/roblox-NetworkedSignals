import { RunService } from "@rbxts/services";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";
import { IClientSignalSender } from "../interfaces/IClientSignalSender";
import { NetworkedSignalDescription } from "../types/NetworkedSignalDescription";
import { waitForNamedChildWhichIsA } from "../functions/WaitForNamedChildWhichIsA";

export class ClientSignalSender<T extends NetworkedSignalCallback = () => void> implements IClientSignalSender<T> {
	private remoteEvent?: RemoteEvent;

	/**
	 * Use create method instead!
	 */
	private constructor(parent: Instance, description: NetworkedSignalDescription<T>) {
		if (!RunService.IsClient()) {
			throw "Attempt to create a ClientSignalSender from server";
		}

		this.remoteEvent = waitForNamedChildWhichIsA(parent, description.name, "RemoteEvent");
	}

	/**
	 * Instantiates a new ClientSignalSender
	 * @param parent The parent Instance holding the networked event
	 * @param description The description for the networked event
	 */
	public static create<T extends NetworkedSignalCallback>(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
	): IClientSignalSender<T> {
		return new ClientSignalSender(parent, description);
	}

	public destroy() {
		this.remoteEvent = undefined;
	}

	public fire(...args: FunctionArguments<T>) {
		if (this.remoteEvent === undefined) {
			throw `Cannot fire a destroyed ClientSignalSender`;
		}

		this.remoteEvent.FireServer(...args);
	}
}
