import { MiddlewareFunc, SignalListenerMiddlewarePayload } from "../types/MiddlewareTypes";
import { NetworkedSignalCallback } from "../types/NetworkedSignalCallback";

export async function checkMiddlewareFuncsAsync<T extends SignalListenerMiddlewarePayload<NetworkedSignalCallback>>(
	payload: T,
	middlewareFuncs: ReadonlyArray<MiddlewareFunc<T>>,
): Promise<boolean> {
	for (const middlewareFunc of middlewareFuncs) {
		if (!(await middlewareFunc(payload))) {
			return false;
		}
	}

	return true;
}
