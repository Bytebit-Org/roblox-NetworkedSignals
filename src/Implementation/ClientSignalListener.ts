import { RunService } from "@rbxts/services";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";
import { IClientSignalListener } from "../Interfaces/IClientSignalListener";
import { ArgumentsTupleCheck } from "../Types/ArgumentsTupleCheck";
import { NetworkedSignalDescription } from "../Types/NetworkedSignalDescription";
import t from "@rbxts/t";
import { PrependPlayerArgToFunc } from "../Types/PrependPlayerArgToFunc";

const IS_STUDIO = RunService.IsStudio();

export class ClientSignalListener<T extends NetworkedEventCallback = () => void> implements IClientSignalListener<T> {
	private readonly tChecks: ArgumentsTupleCheck<T>;

	private readonly remoteEvent: RemoteEvent;

	/**
	 * Use create method instead!
	 */
	private constructor(parent: Instance, description: NetworkedSignalDescription<T>) {
		if (!RunService.IsServer()) {
			throw "Attempt to create a ClientSignalListener from client";
		}

		this.tChecks = description.tChecks;

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
	 * Instantiates a new ClientSignalListener
	 * @param parent The parent Instance holding the networked event
	 * @param description The description for the networked event
	 */
	public static create<T extends NetworkedEventCallback>(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
	): IClientSignalListener<T> {
		return new ClientSignalListener(parent, description);
	}

	public connect(callback: PrependPlayerArgToFunc<T>): RBXScriptConnection {
		return this.remoteEvent.OnServerEvent.Connect((player: Player, ...args: Array<unknown>) => {
			if (this.doArgumentsSatisfyChecks(args)) {
				callback(player, ...args);
			} else if (IS_STUDIO) {
				error(`Invalid arguments passed to client signal ${this.remoteEvent.Name}`);
			}
		});
	}

	public destroy() {
		this.remoteEvent.Destroy();
	}

	public wait(): FunctionArguments<PrependPlayerArgToFunc<T>> {
		while (true) {
			const waitResults = this.remoteEvent.OnServerEvent.Wait();
			if (this.doArgumentsSatisfyChecksWithPlayerArg(waitResults)) {
				return waitResults;
			}
		}
	}

	private doArgumentsSatisfyChecks(args: Array<unknown>): args is FunctionArguments<T> {
		if (args.size() !== this.tChecks.size()) {
			if (IS_STUDIO) {
				error(`Invalid number of arguments passed to client signal ${this.remoteEvent.Name}`);
			}
			return false;
		}

		for (let i = 0; i < args.size(); i++) {
			if (!this.tChecks[i](args[i])) {
				if (IS_STUDIO) {
					error(
						`Argument ${i} does not pass type check for client signal ${this.remoteEvent.Name} - given value: ${args[i]}`,
					);
				}
				return false;
			}
		}

		return true;
	}

	private doArgumentsSatisfyChecksWithPlayerArg(
		args: Array<unknown>,
	): args is FunctionArguments<PrependPlayerArgToFunc<T>> {
		if (!t.instanceIsA("Player")(args[0])) {
			return false;
		}

		// +1 for player arg
		if (args.size() !== this.tChecks.size() + 1) {
			if (IS_STUDIO) {
				error(`Invalid number of arguments passed to client signal ${this.remoteEvent.Name}`);
			}
			return false;
		}

		for (let i = 0; i < args.size() - 1; i++) {
			// +1 for player arg
			if (!this.tChecks[i](args[i + 1])) {
				if (IS_STUDIO) {
					error(
						`Argument ${i} does not pass type check for client signal ${
							this.remoteEvent.Name
						} - given value: ${args[i + 1]}`,
					);
				}
				return false;
			}
		}

		return true;
	}
}
