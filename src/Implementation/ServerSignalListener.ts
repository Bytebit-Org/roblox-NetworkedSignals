import { RunService } from "@rbxts/services";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";
import { ArgumentsTupleTypesCheck } from "../types/ArgumentsTupleTypesCheck";
import { IServerSignalListener } from "../interfaces/IServerSignalListener";
import { NetworkedSignalDescription } from "../types/NetworkedSignalDescription";
import { waitForNamedChildWhichIsA } from "../functions/WaitForNamedChildWhichIsA";
import { MiddlewareFunc, ServerSignalListenerMiddlewarePayload } from "types/MiddlewareTypes";
import { checkMiddlewareFuncsAsync } from "functions/checkMiddlewareFuncsAsync";

const IS_STUDIO = RunService.IsStudio();

export class ServerSignalListener<T extends NetworkedSignalCallback = () => void> implements IServerSignalListener<T> {
	private readonly middlewareFuncs?: ReadonlyArray<MiddlewareFunc<ServerSignalListenerMiddlewarePayload<T>>>;
	private readonly minNumberOfArguments: number;
	private readonly name: string;
	private readonly tChecks: ArgumentsTupleTypesCheck<T>;
	private readonly shouldCheckInboundArgumentTypes: boolean;

	private remoteEvent?: RemoteEvent;

	/**
	 * Use create method instead!
	 */
	private constructor(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
		shouldCheckInboundArgumentTypes?: boolean,
	) {
		if (!RunService.IsClient()) {
			throw "Attempt to create a ServerSignalListener from server";
		}

		this.middlewareFuncs = description.serverSignalListenerMiddleware;
		this.name = description.name;
		this.tChecks = description.typeChecks;
		this.shouldCheckInboundArgumentTypes = shouldCheckInboundArgumentTypes ?? true;

		let numberOfRequiredArguments = this.tChecks.size();
		while (numberOfRequiredArguments > 0 && this.tChecks[numberOfRequiredArguments - 1](undefined)) {
			numberOfRequiredArguments--;
		}
		this.minNumberOfArguments = numberOfRequiredArguments;

		this.remoteEvent = waitForNamedChildWhichIsA(parent, description.name, "RemoteEvent");
	}

	/**
	 * Instantiates a new ServerSignalListener
	 * @param parent The parent Instance holding the networked event
	 * @param description The description for the networked event
	 * @param shouldCheckInboundArgumentTypes An optional parameter that describes whether all arguments should be type checked. Defaults to true.
	 */
	public static create<T extends NetworkedSignalCallback>(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
		shouldCheckInboundArgumentTypes?: boolean,
	): IServerSignalListener<T> {
		return new ServerSignalListener(parent, description, shouldCheckInboundArgumentTypes);
	}

	public connect(callback: T): RBXScriptConnection {
		if (this.remoteEvent === undefined) {
			throw `Cannot connect to destroyed ServerSignalListener`;
		}

		return this.remoteEvent.OnClientEvent.Connect(async (...args: Array<unknown>) => {
			if (!this.areArgumentsValid(args)) {
				if (IS_STUDIO) {
					error(`Invalid arguments passed to server signal ${this.name}`);
				}

				return;
			}

			if (this.middlewareFuncs !== undefined) {
				const payload: ServerSignalListenerMiddlewarePayload<T> = {
					args: args,
					signalName: this.name,
				};
				if (!(await checkMiddlewareFuncsAsync(payload, this.middlewareFuncs))) {
					return;
				}
			}

			callback(...args);
		});
	}

	public destroy() {
		this.remoteEvent = undefined;
	}

	public wait(): FunctionArguments<T> {
		if (this.remoteEvent === undefined) {
			throw `Cannot wait for destroyed ServerSignalListener`;
		}

		while (true) {
			const waitResults = this.remoteEvent.OnClientEvent.Wait();
			if (this.areArgumentsValid(waitResults)) {
				return waitResults;
			}
		}
	}

	private areArgumentsValid(args: Array<unknown>): args is FunctionArguments<T> {
		// Yes, this is basically just a type assertion for TypeScript if this.shouldCheckInboundArgumentTypes is false
		// That's okay - this is client side and is checking arguments from the server, so it should be safe
		if (!this.shouldCheckInboundArgumentTypes || this.doArgumentsSatisfyChecks(args)) {
			return true;
		}

		if (IS_STUDIO) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			error(`Invalid arguments passed to server signal '${this.name}'`);
		}

		return false;
	}

	private doArgumentsSatisfyChecks(args: Array<unknown>): args is FunctionArguments<T> {
		const numberOfArgumentsProvided = args.size();
		if (this.tChecks.size() < numberOfArgumentsProvided || numberOfArgumentsProvided < this.minNumberOfArguments) {
			if (IS_STUDIO) {
				error(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					`Invalid number of arguments passed to server signal '${this.name}'. Expected at least ${
						this.minNumberOfArguments
					} and at most ${this.tChecks.size()}, got ${numberOfArgumentsProvided}.`,
				);
			}
			return false;
		}

		for (let i = 0; i < args.size(); i++) {
			if (!this.tChecks[i](args[i])) {
				if (IS_STUDIO) {
					error(
						`Argument ${i} does not pass type check for server signal ${
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							this.remoteEvent!.Name
						} - given value: ${args[i]}`,
					);
				}
				return false;
			}
		}

		return true;
	}
}
