// TODO: Revisit this definition... It's currently just anyargs but we want to not allow undefined values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NetworkedEventCallback = (...args: Array<any>) => void;
