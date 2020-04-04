import { RunService } from "@rbxts/services";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";
import { IClientSignalSender } from "../Interfaces/IClientSignalSender";
import { NetworkedSignalDescription } from "../Types/NetworkedSignalDescription";
import { waitForNamedChildWhichIsA } from "../Functions/WaitForNamedChildWhichIsA";

if (RunService.IsStudio() && RunService.IsServer()) {
	error("Attempt to require ClientSignalSender from server");
}

export class ClientSignalSender<T extends NetworkedEventCallback> implements IClientSignalSender<T> {
	private remoteEvent?: RemoteEvent;

	/**
	 * Use create method instead!
	 */
	private constructor(parent: Instance, description: NetworkedSignalDescription<T>) {
		this.remoteEvent = waitForNamedChildWhichIsA(parent, description.name, "RemoteEvent");
	}

	/**
	 * Instantiates a new ClientSignalSender
	 * @param parent The parent Instance holding the networked event
	 * @param description The description for the networked event
	 */
	public static create<T extends NetworkedEventCallback>(
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
