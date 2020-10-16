import { RunService } from "@rbxts/services";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";
import { IClientSignalListener } from "../interfaces/IClientSignalListener";
import { ArgumentsTupleTypesCheck } from "../types/ArgumentsTupleTypesCheck";
import { NetworkedSignalDescription } from "../types/NetworkedSignalDescription";
import t from "@rbxts/t";
import { PrependPlayerArgToFunc } from "../types/PrependPlayerArgToFunc";
import { checkMiddlewareFuncsAsync } from "functions/checkMiddlewareFuncsAsync";
import { MiddlewareFunc, ClientSignalListenerMiddlewarePayload } from "types/MiddlewareTypes";

const IS_STUDIO = RunService.IsStudio();

export class ClientSignalListener<T extends NetworkedSignalCallback = () => void> implements IClientSignalListener<T> {
	private readonly middlewareFuncs?: ReadonlyArray<MiddlewareFunc<ClientSignalListenerMiddlewarePayload<T>>>;
	private readonly minNumberOfArguments: number;
	private readonly name: string;
	private readonly remoteEvent: RemoteEvent;
	private readonly tChecks: ArgumentsTupleTypesCheck<T>;

	/**
	 * Use create method instead!
	 */
	private constructor(parent: Instance, description: NetworkedSignalDescription<T>) {
		if (!RunService.IsServer()) {
			throw "Attempt to create a ClientSignalListener from client";
		}

		this.middlewareFuncs = description.clientSignalListenerMiddleware;
		this.name = description.name;
		this.tChecks = description.typeChecks;

		let numberOfRequiredArguments = this.tChecks.size();
		while (numberOfRequiredArguments > 0 && this.tChecks[numberOfRequiredArguments - 1](undefined)) {
			numberOfRequiredArguments--;
		}
		this.minNumberOfArguments = numberOfRequiredArguments;

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
	public static create<T extends NetworkedSignalCallback>(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
	): IClientSignalListener<T> {
		return new ClientSignalListener(parent, description);
	}

	public connect(callback: PrependPlayerArgToFunc<T>): RBXScriptConnection {
		return this.remoteEvent.OnServerEvent.Connect(async (player: Player, ...args: Array<unknown>) => {
			if (!this.doArgumentsSatisfyChecks(args)) {
				if (IS_STUDIO) {
					error(`Invalid arguments passed to client signal ${this.name}`);
				}

				return;
			}

			if (this.middlewareFuncs !== undefined) {
				const payload: ClientSignalListenerMiddlewarePayload<T> = {
					args: args,
					signalName: this.name,
					sourcePlayer: player,
				};
				if (!(await checkMiddlewareFuncsAsync(payload, this.middlewareFuncs))) {
					return;
				}
			}

			callback(player, ...args);
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
		const numberOfArgumentsProvided = args.size();
		if (this.tChecks.size() < numberOfArgumentsProvided || numberOfArgumentsProvided < this.minNumberOfArguments) {
			if (IS_STUDIO) {
				error(
					`Invalid number of arguments passed to client signal ${this.name}. Expected at least ${
						this.minNumberOfArguments
					} and at most ${this.tChecks.size()}, got ${numberOfArgumentsProvided}.`,
				);
			}
			return false;
		}

		for (let i = 0; i < numberOfArgumentsProvided; i++) {
			if (!this.tChecks[i](args[i])) {
				if (IS_STUDIO) {
					error(
						`Argument ${i} does not pass type check for client signal ${this.name} - given value: ${args[i]}`,
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
				error(`Invalid number of arguments passed to client signal ${this.name}`);
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
