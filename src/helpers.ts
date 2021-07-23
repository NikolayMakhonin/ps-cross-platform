export type TCallback<T> = (err: Error, result: T) => void
export type TFuncWithCallback<T> = (callback: TCallback<T>) => void

export function asPromise<T>(func: TFuncWithCallback<T>) {
	return new Promise<T>((resolve, reject) => {
		func((err, result) => {
			if (err) {
				reject(err)
				return
			}
			resolve(result)
		})
	})
}
