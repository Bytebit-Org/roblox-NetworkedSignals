import { Players, RunService } from "@rbxts/services";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";
import { IServerSignalSender } from "../Interfaces/IServerSignalSender";
import { NetworkedSignalDescription } from "../Types/NetworkedSignalDescription";

if (RunService.IsStudio() && RunService.IsClient()) {
	error("Attempt to require ServerSignalSender from client");
}

export class ServerSignalSender<T extends NetworkedEventCallback = () => void> implements IServerSignalSender<T> {
	private readonly remoteEvent: RemoteEvent;

	/**
	 * Use create method instead!
	 */
	private constructor(parent: Instance, description: NetworkedSignalDescription<T>) {
		const remoteEventCandidate = parent.FindFirstChild(description.name);
		if (remoteEventCandidate !== undefined && remoteEventCandidate.IsA("RemoteEvent")) {
			this.remoteEvent = remoteEventCandidate;
		} else {
			const newRemoteEvent = new Instance("RemoteEvent");
			newRemoteEvent.Name = description.name;
			newRemoteEvent.Parent = parent;

			this.remoteEvent = newRemoteEvent;
		}
	}

	/**
	 * Instantiates a new ServerSignalSender
	 * @param parent The parent Instance holding the networked event
	 * @param description The description for the networked event
	 */
	public static create<T extends NetworkedEventCallback>(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
	): IServerSignalSender<T> {
		return new ServerSignalSender(parent, description);
	}

	public destroy() {
		this.remoteEvent.Destroy();
	}

	public fireToPlayer(player: Player, ...args: FunctionArguments<T>) {
		this.remoteEvent.FireClient(player, ...args);
	}

	public fireToAll(...args: FunctionArguments<T>) {
		this.remoteEvent.FireAllClients(...args);
	}

	public fireToWhitelist(playersWhitelist: Array<Player>, ...args: FunctionArguments<T>) {
		playersWhitelist.forEach(player => this.remoteEvent.FireClient(player, ...args));
	}

	public fireToOthers(playersBlacklist: Array<Player>, ...args: FunctionArguments<T>) {
		const playersBlacklistSet = new Set(playersBlacklist);
		Players.GetPlayers()
			.filter(player => !playersBlacklistSet.has(player))
			.forEach(player => this.remoteEvent.FireClient(player, ...args));
	}
}
