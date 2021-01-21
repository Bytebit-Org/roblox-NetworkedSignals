import { NetworkedSignalDescription } from "./NetworkedSignalDescription";

export type GetNetworkedSignalCallbackType<T> = T extends NetworkedSignalDescription<infer U> ? U : never;
