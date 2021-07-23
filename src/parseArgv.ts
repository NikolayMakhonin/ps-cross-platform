export function parseArgv(commandLine: string): string[] {
	const QUOTE = 34
	const BACK_SLASH = 92
	const SPACE = 32
	const TAB = 9

	const argv: string[] = []
	const arg: number[] = []
	let argNotNull = false
	let prevCh = 0
	let quoteOpened = false
	for (let i = 0, len = commandLine.length; i < len; i++) {
		const ch = commandLine.charCodeAt(i)
		if (prevCh === BACK_SLASH) {
			if (ch === BACK_SLASH || ch === QUOTE) {
				arg.push(ch)
				prevCh = 0
				continue
			} else {
				arg.push(BACK_SLASH)
			}
		}

		if (prevCh === QUOTE) {
			if (ch === QUOTE) {
				arg.push(ch)
				prevCh = 0
				continue
			} else {
				quoteOpened = false
			}
		}

		if (ch === BACK_SLASH) {
			if (i === len - 1) {
				arg.push(ch)
				break
			}
			prevCh = ch
			continue
		}

		if (ch === QUOTE) {
			if (!quoteOpened) {
				argNotNull = true
				quoteOpened = true
				prevCh = 0
				continue
			}

			prevCh = ch
			continue
		}

		if (!quoteOpened && (ch === SPACE || ch === TAB)) {
			if (arg.length || argNotNull) {
				argNotNull = false
				argv.push(String.fromCharCode(...arg))
				arg.length = 0
			}
			prevCh = 0
			continue
		}

		arg.push(ch)
		prevCh = 0
	}

	if (arg.length || argNotNull) {
		argv.push(String.fromCharCode(...arg))
	}

	return argv
}
