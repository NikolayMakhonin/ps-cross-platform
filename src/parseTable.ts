export type TRow = { [key: string] : string }

export type TColumnOptions = {
	align: 'left' | 'right'
}

export function parseTable({
	text,
	columnDefault,
	columns,
	filter,
}: {
	text: string,
	columnDefault: TColumnOptions,
	columns?: {
		[name: string]: TColumnOptions,
	},
	filter?: (line: string) => boolean,
}): TRow[] {
	const lines = text.split('\n')
		.filter(line => {
			return line.trim() && (!filter || filter(line))
		})

	if (lines.length === 0) {
		return []
	}

	type THeader = {
		name: string
		start: number
		endExclusive: number
		options: TColumnOptions
	}
	const headers: THeader[] = []
	const rows: TRow[] = []

	// parse header
	{
		const line = lines[0]
		let start = 0
		let prevCh = 32
		for (let i = 0, len = line.length; i < len; i++) {
			const ch = line.charCodeAt(i)
			if (ch !== 32 && prevCh === 32) {
				start = i
			}
			if ((ch === 32 || i === len - 1) && prevCh !== 32) {
				const endExclusive = i === len - 1
					? i + 1
					: i
				const name = line.substring(start, endExclusive)
				headers.push({
					name,
					start,
					endExclusive,
					options: columns && columns[name] || columnDefault,
				})
			}
			prevCh = ch
		}
	}

	for (let nLine = 1, linesCount = lines.length; nLine < linesCount; nLine++) {
		const line = lines[nLine]
		const row: TRow = {}

		for (let nCol = 0, len = headers.length; nCol < len; nCol++) {
			const {
				name,
				start: headerStart,
				endExclusive: headerEndExclusive,
				options: {align},
			} = headers[nCol]

			let start: number
			let endExclusive: number
			switch (align) {
				case 'left':
					start = headerStart
					if (nCol === len - 1) {
						endExclusive = line.length
					} else {
						const headerNext = headers[nCol + 1]
						if (headerNext.options.align !== 'left') {
							throw new Error('Cannot parse table:\r\n' + text)
						}
						endExclusive = headerNext.start
					}
					break
				case 'right':
					endExclusive = headerEndExclusive
					if (nCol === 0) {
						start = 0
					} else {
						const headerPrev = headers[nCol - 1]
						if (headerPrev.options.align !== 'right') {
							throw new Error('Cannot parse table:\r\n' + text)
						}
						start = headerPrev.endExclusive
					}
					break
				default:
					throw new Error('Unknown align: ' + align)
			}

			const value = line.substring(start, endExclusive).trim()
			row[name] = value
		}

		rows.push(row)
	}

	return rows
}
