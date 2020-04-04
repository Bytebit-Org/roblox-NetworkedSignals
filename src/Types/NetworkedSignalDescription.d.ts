import { NetworkedEventCallback } from "./NetworkedEventCallback";
import { ArgumentsTupleCheck } from "./ArgumentsTupleCheck";

/**
 * Defines the description of a networked signal
 */
export type NetworkedSignalDescription<T extends NetworkedEventCallback> = {
	/** The name of the signal */
	readonly name: string;

	/** The set of type checks to apply to signal arguments */
	readonly tChecks: ArgumentsTupleCheck<T>;
};
