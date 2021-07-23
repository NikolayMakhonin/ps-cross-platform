export function parseArgv(commandLine: string): string[] {
	const argv: string[] = []
	const arg: number[] = []
	let argNotNull = false
	let quotes = 0
	for (let i = 0, len = commandLine.length; i < len; i++) {
		const ch = commandLine.charCodeAt(i)
		// quote
		if (ch === 34) {
			argNotNull = true
			quotes++
			if (quotes === 3) {
				quotes = 1
				arg.push(ch)
			}
		} else if (quotes === 1) {
			arg.push(ch)
		} else {
			quotes = 0
			// space or tab
			if (ch === 32 || ch === 9) {
				if (argNotNull) {
					argNotNull = false
					argv.push(String.fromCharCode(...arg))
					arg.length = 0
				}
			} else {
				argNotNull = true
				arg.push(ch)
			}
		}
	}

	if (argNotNull) {
		argv.push(String.fromCharCode(...arg))
	}

	return argv
}
