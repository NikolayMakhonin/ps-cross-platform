export type TRow = { [key: string] : string }

export function parseTable(str: string): TRow[] {
	const lines = str.split('\n')
	let header: string[]
	const rows: TRow[] = []
	for (let lineIndex = 0, linesCount = lines.length; lineIndex < linesCount; lineIndex++) {
		const line = lines[lineIndex].trim()
		if (!line) {
			continue
		}

		const cells = line.split(/\s+/)

		if (!header) {
			header = cells
			continue
		}

		const row: TRow = {}
		for (let i = 0, len = cells.length; i < len; i++) {
			const name = header[i]
			const value = cells[i]
			row[name] = value
		}

		rows.push(row)
	}

	return rows
}
