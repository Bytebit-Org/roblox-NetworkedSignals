import { RunService } from "@rbxts/services";
import { NetworkedEventCallback } from "../Types/NetworkedEventCallback";
import { ArgumentsTupleCheck } from "../Types/ArgumentsTupleCheck";
import { IServerSignalListener } from "../Interfaces/IServerSignalListener";
import { NetworkedSignalDescription } from "../Types/NetworkedSignalDescription";
import { waitForNamedChildWhichIsA } from "../Functions/WaitForNamedChildWhichIsA";

const IS_STUDIO = RunService.IsStudio();

export class ServerSignalListener<T extends NetworkedEventCallback = () => void> implements IServerSignalListener<T> {
	private readonly minNumberOfArguments: number;
	private readonly tChecks: ArgumentsTupleCheck<T>;
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

		this.tChecks = description.tChecks;
		this.shouldCheckInboundArgumentTypes =
			shouldCheckInboundArgumentTypes !== undefined ? shouldCheckInboundArgumentTypes : false;

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
	 * @param shouldCheckInboundArgumentTypes An optional parameter that describes whether all arguments should be type checked. Defaults to false.
	 */
	public static create<T extends NetworkedEventCallback>(
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

		return this.remoteEvent.OnClientEvent.Connect((...args: Array<unknown>) => {
			if (this.areArgumentsValid(args)) {
				callback(...args);
			}
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
		// Yes, this is basically just a type assertion for TypeScript if shouldDoTypeCheckOnArguments() returns false
		// That's okay - this is client side and is checking arguments from the server, so it should be safe
		if (!this.shouldDoTypeCheckOnArguments() || this.doArgumentsSatisfyChecks(args)) {
			return true;
		}

		if (IS_STUDIO) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			error(`Invalid arguments passed to server signal ${this.remoteEvent!.Name}`);
		}

		return false;
	}

	private shouldDoTypeCheckOnArguments() {
		return !this.shouldCheckInboundArgumentTypes;
	}

	private doArgumentsSatisfyChecks(args: Array<unknown>): args is FunctionArguments<T> {
		const numberOfArgumentsProvided = args.size();
		if (this.minNumberOfArguments < numberOfArgumentsProvided || numberOfArgumentsProvided > this.tChecks.size()) {
			if (IS_STUDIO) {
				error(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					`Invalid number of arguments passed to server signal ${this.remoteEvent!.Name}. Expected at least ${
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
