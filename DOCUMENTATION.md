# Networked Signals Documentation

- [Types](#types)
  * [NetworkedSignalCallback](#networkedsignalcallback)
  * [SignalListenerMiddlewarePayload](#signallistenermiddlewarepayload)
  * [MiddlewareFunc](#middlewarefunc)
  * [NetworkedSignalDescription](#networkedsignaldescription)
- [Interfaces](#interfaces)
  * [IClientSignalListener](#iclientsignallistener)
  * [IClientSignalSender](#iclientsignalsender)
  * [IServerSignalListener](#iserversignallistener)
  * [IServerSignalSender](#iserversignalsender)
- [Classes](#classes)
  * [ClientSignalListener](#clientsignallistener)
    + [Constructors](#constructors)
  * [ClientSignalSender](#clientsignalsender)
    + [Constructors](#constructors-1)
  * [ServerSignalListener](#serversignallistener)
    + [Constructors](#constructors-2)
  * [ServerSignalSender](#serversignalsender)
    + [Constructors](#constructors-3)

This documentation is written using TypeScript syntax and assumes basic knowledge of TypeScript's syntax and type system. Readers who do not understand are encouraged to learn the basics of TypeScript's syntax and type system online from the wealth of existing resources.

## Types
### NetworkedSignalCallback
```ts
type NetworkedSignalCallback = (...args: Array<unknown>) => void;
```
Defines a callback function that helps define the arguments for a given signal.

NOTE: for the [`IClientSignalListener`](#IClientSignalListner) the arguments will be prefixed with the source client's [`Player`](https://developer.roblox.com/en-us/api-reference/class/Player).

### SignalListenerMiddlewarePayload
```ts
type SignalListenerMiddlewarePayload<T extends NetworkedSignalCallback> = {
	readonly args: FunctionArguments<T>;
	readonly signalName: string;
}
```

This is the base type for middleware payloads. There is a variant for server signals, which is exactly this, and then a client signal signal variant which includes the `sourcePlayer` field which is of type [`Player`](https://developer.roblox.com/en-us/api-reference/class/Player).

### MiddlewareFunc
```ts
type MiddlewareFunc<T extends SignalListenerMiddlewarePayload<NetworkedSignalCallback>> =
	| ((payload: T) => boolean)
	| ((payload: T) => Promise<boolean>)
```

This is the type for middleware functions. Essentially, they should expect to receive a middleware payload and should return a boolean, either as an asynchronous function (i.e. returning a [`Promise`](https://github.com/evaera/roblox-lua-promise)) or as a synchronous function (generally considered a standard function).

### NetworkedSignalDescription
```ts
type NetworkedSignalDescription<T extends NetworkedSignalCallback = () => void> = {
	/** The optional set of middleware functions for signals fired from the client */
	readonly clientSignalListenerMiddleware?: ReadonlyArray<MiddlewareFunc<ClientSignalListenerMiddlewarePayload<T>>>;

	/** The name of the signal */
	readonly name: string;

	/** The optional set of middleware functions for signals fired from the server */
	readonly serverSignalListenerMiddleware?: ReadonlyArray<MiddlewareFunc<ServerSignalListenerMiddlewarePayload<T>>>;

	/** The set of type checks to apply to signal arguments */
	readonly typeChecks: ArgumentsTupleTypesCheck<T>;
}
```

This describes the full set of fields for describing networked signals.

## Interfaces
These interfaces define the set of public members on the classes defined below. As such, the classes will only include their constructor and extra members, if any.

### IClientSignalListener
```ts
interface IClientSignalListener<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Connects to remote signals sent from a client
	 * @param callback The callback function that is used when a signal is received
	 */
	connect(callback: PrependPlayerArgToFunc<T>): ISignalConnection;

	/**
	 * Yields until a signal is received
	 * @returns The player of the client sending the signal and the signal arguments
	 */
	wait(): FunctionArguments<PrependPlayerArgToFunc<T>>;
}
```

Defines a client signal listener.

### IClientSignalSender
```ts
interface IClientSignalSender<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Fires a signal from the client to the server
	 * @param args The arguments to send with the signal
	 */
	fire(...args: FunctionArguments<T>): void;
}
```

Defines a client signal sender.

### IServerSignalListener
```ts
interface IServerSignalListener<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Connects to remote signals sent from the server
	 * @param callback The callback function that is used when a signal is received
	 */
	connect(callback: T): RBXScriptConnection;

	/**
	 * Yields until a signal is received
	 * @returns The signal arguments
	 */
	wait(): FunctionArguments<T>;
}
```

Defines a server signal listener.

### IServerSignalSender
```ts
interface IServerSignalSender<T extends NetworkedSignalCallback = () => void> extends IDestroyable {
	/**
	 * Fires a signal from the server to a specified client
	 * @param player The player whose client will receive the signal
	 * @param args The arguments to send with the signal
	 */
	fireToPlayer(player: Player, ...args: FunctionArguments<T>): void;

	/**
	 * Fires a signal from the server to all existing clients
	 * @param args The arguments to send with the signal
	 */
	fireToAll(...args: FunctionArguments<T>): void;

	/**
	 * Fires a signal from the server to a set of clients
	 * @param playersWhitelist The list of players whose clients will receive the signal
	 * @param args The arguments to send with the signal
	 */
	fireToWhitelist(playersWhitelist: ReadonlyArray<Player>, ...args: FunctionArguments<T>): void;

	/**
	 * Fires a signal from the server to all existing clients except those listed
	 * @param playersBlacklist The list of players whose clients will not receive the signal
	 * @param args The arguments to send with the signal
	 */
	fireToOthers(playersBlacklist: ReadonlyArray<Player>, ...args: FunctionArguments<T>): void;
}
```

Defines a server signal sender.

## Classes
Please note that these class definitions will only show the methods for creating an instance of the class and class members that are extraneous to the interface(s) implemented, if any.

### ClientSignalListener
Implements [`IClientSignalListener`](#IClientSignalListener).

#### Constructors
```ts
public static create<T extends NetworkedSignalCallback>(
	parent: Instance,
	description: NetworkedSignalDescription<T>,
): IClientSignalListener<T>
```

### ClientSignalSender
Implements [`IClientSignalSender`](#IClientSignalSender).

#### Constructors
```ts
public static create<T extends NetworkedSignalCallback>(
	parent: Instance,
	description: NetworkedSignalDescription<T>,
): IClientSignalSender<T>
```

### ServerSignalListener
Implements [`IServerSignalListener`](#IServerSignalListener).

#### Constructors
```ts
public static create<T extends NetworkedSignalCallback>(
	parent: Instance,
	description: NetworkedSignalDescription<T>,
	shouldCheckInboundArgumentTypes?: boolean,
): IServerSignalListener<T>
```

### ServerSignalSender
Implements [`IServerSignalSender`](#IServerSignalSender).

#### Constructors
```ts
public static create<T extends NetworkedSignalCallback>(
		parent: Instance,
		description: NetworkedSignalDescription<T>,
	): IServerSignalSender<T>
```
