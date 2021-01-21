# Networked Signals Tutorial
- [Terminology](#terminology)
  * [Server Signals and Client Signals](#server-signals-and-client-signals)
  * [Type checks](#type-checks)
  * [Middleware](#middleware)
- [Networked Signal Descriptions](#networked-signal-descriptions)
- [Writing the client-side](#writing-the-client-side)
- [Writing the server-side](#writing-the-server-side)

Networked Signals is meant to provide type safety and utility for better server-and-client communication. This includes providing the possibility for a central signals configuration file, adding type checks for signal arguments, and adding middleware functions to make common logic reusable. Each of these topics will be covered below.

## Terminology
The first thing to learn is the terminology, because it can be a little confusing until it clicks for you.

### Server Signals and Client Signals
The main concepts are "Server Signals" and "Client Signals". These signals are named based on their source type. So, "Server Signals" are fired by the _server_ and to a _client_ and "Client Signals" are the opposite. To make this more clear, here a concise breakdown of how to use the primary classes:

- Server-side
  - `ClientSignalListener` \
  This is responsible for listening to signals fired from the client to the server.
  - `ServerSignalSender` \
  This is responsible for sending signals from the server to a set of clients.
- Client-side
  - `ClientSignalSender` \
  This is responsible for sending signals from the current client to the server.
  - `ServerSignalListener` \
  This is responsible for listening to signals fired from the server to the current client.

### Type checks
This is the biggest feature of this library - type safety! This library is written with roblox-ts, where type safety is among the most important reasons to choose that tool already, but this type safety also works for plain Lua (or Luau). Type checks are just functions that return `true` if the value they're given match the appropriate type for that function or `false` otherwise. For example, you could have a function that checks that the given argument is a number or a Part instance. It is recommended that users use [the t library](https://github.com/osyrisrblx/t) for these purposes as much as possible.

### Middleware
Middleware functions are meant to provide the ability to use shared code across multiple signals for things like validation / verification. For example, a middleware function could throttle signals from the client to prevent bad actors from slowing the game down by firing signals that would otherwise cause expensive computations on the server. These functions are meant to return `true` if the signal can continue to be processed or `false` if the signal processing should halt. These functions are run in-order before running the standard signal handler.

## Networked Signal Descriptions
In order to provide easier type safety, it is nice to be able to keep a central place for signal descriptions that is shared between server and client sot that if one changes, they both do. It is recommended that users define all their signal descriptions in a single object. Here's an example of describing networked signals for a map selection vote:

<details><summary>Using roblox-ts</summary><p>

```ts
import type { NetworkedSignalDescription } from "@rbxts/networked-signals";

export const NetworkedSignalDescriptions = {
    Voted: identity<NetworkedSignalDescription<(mapName: string) => void>({
        clientSignalListenerMiddleware: [], // Could add some middleware functions here for when the client sends a signal to the server
        name: "VotedForMap",
        typeChecks: [t.string],
    }),
    VoteForMapRequested: identity<NetworkedSignalDescription>({
        name: "VoteForMapRequested",
        serverSignalListenerMiddleware: [], // Could add some middleware functions here for when the server sends a signal to the client
        typeChecks: [],
    }),
};
```

</p></details>

<details><summary>Using Lua / Luau</summary><p>

```lua
-- Run this as a ModuleScript
return {
    VotedForMap = {
        clientSignalListenerMiddleware = {}, -- Could add some middleware functions here for when the client sends a signal to the server
        name = "VotedForMap",
        typeChecks = {t.string},
    },
    VoteForMapRequested = {
        name = "VoteForMapRequested",
        serverSignalListenerMiddleware = [], -- Could add some middleware functions here for when the server sends a signal to the client
        typeChecks = {},
    }),
}
```

</p></details>

## Writing the client-side
The client-side is responsible for listening to signals from the server ("Server Signals") and firing signals from itself ("Client Signals"). Here's an example of writing the client-side for that map selection vote seen before:

<details><summary>Using roblox-ts</summary><p>

```ts
import { ReplicatedStorage } from "@rbxts/services";
import type { ClientSignalSender, GetNetworkedSignalCallbackType, IClientSignalSender, IServerSignalListener, ServerSignalListener } from "@rbxts/networked-signals";
import { NetworkedSignalDescriptions } from "ReplicatedStorage/NetworkedSignalDescriptions";

const votedForMapClientSignalSender: IClientSignalSender<GetNetworkedSignalCallbackType<typeof NetworkedSignalDescriptions.VotedForMap>> = ClientSignalSender.create(ReplicatedStorage, NetworkedSignalDescriptions.VotedForMap);
const voteForMapRequestedServerSignalListener: IServerSignalListener<GetNetworkedSignalCallbackType<typeof NetworkedSignalDescriptions.VoteForMapRequested>> = ServerSignalListener.create(ReplicatedStorage, NetworkedSignalDescriptions.VoteForMapRequested);

mapVoteRequestedServerSignalListener.connect(() => {
    // Show the options and let the player select one
});

function onVoteSelected(mapName: string) {
    votedForMapClientSignalSender.fire(mapName);
}
```

</p></details>

<details><summary>Using Lua / Luau</summary><p>

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local networkedSignalsPackage = require(path.to.networked.signals.package)
local ClientSignalSender = networkedSignalsPackage.ClientSignalSender
local ServerSignalListener = networkedSignalsPackage.ServerSignalListener

local networkedSignalDescriptions = require(path.to.networked.signal.descriptions)

local votedForMapClientSignalSender = ClientSignalSender.create(ReplicatedStorage, NetworkedSignalDescriptions.VotedForMap);
local voteForMapRequestedServerSignalListener = ServerSignalListener.create(ReplicatedStorage, NetworkedSignalDescriptions.VoteForMapRequested);

mapVoteRequestedServerSignalListener:connect(function ()
    -- Show the options and let the player select one
end);

function onVoteSelected(mapName) {
    votedForMapClientSignalSender:fire(mapName);
}
```

</p></details>

## Writing the server-side
The server-side is responsible for listening to signals from the client ("Client Signals") and firing signals from itself ("Server Signals"). Here's an example of writing the server-side for that map selection vote seen before:

<details><summary>Using roblox-ts</summary><p>

```ts
import { ReplicatedStorage } from "@rbxts/services";
import type { ClientSignalListener, GetNetworkedSignalCallbackType, IClientSignalListener, IServerSignalSender, ServerSignalSender } from "@rbxts/networked-signals";
import { NetworkedSignalDescriptions } from "ReplicatedStorage/NetworkedSignalDescriptions";

const votedForMapClientSignalListener: IClientSignalListener<GetNetworkedSignalCallbackType<typeof NetworkedSignalDescriptions.VotedForMap>> = ClientSignalListener.create(ReplicatedStorage, NetworkedSignalDescriptions.VotedForMap);
const voteForMapRequestedServerSignalSender: IServerSignalSender<GetNetworkedSignalCallbackType<typeof NetworkedSignalDescriptions.VoteForMapRequested>> = ServerSignalSender.create(ReplicatedStorage, NetworkedSignalDescriptions.VoteForMapRequested);

votedForMapClientSignalListener.connect((player, mapName) => {
    // Handle the vote
});

voteForMapRequestedServerSignalSender.fireToAll();
```

</p></details>

<details><summary>Using Lua / Luau</summary><p>

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local networkedSignalsPackage = require(path.to.networked.signals.package)
local ClientSignalListener = networkedSignalsPackage.ClientSignalListener
local ServerSignalSender = networkedSignalsPackage.ServerSignalSender

local networkedSignalDescriptions = require(path.to.networked.signal.descriptions)

local votedForMapClientSignalSender = ClientSignalSender.create(ReplicatedStorage, NetworkedSignalDescriptions.VotedForMap);
local voteForMapRequestedServerSignalListener = ServerSignalListener.create(ReplicatedStorage, NetworkedSignalDescriptions.VoteForMapRequested);

votedForMapClientSignalListener:connect(function (player, mapName)
    // Handle the vote
end);

voteForMapRequestedServerSignalSender:fireToAll();
```

</p></details>
