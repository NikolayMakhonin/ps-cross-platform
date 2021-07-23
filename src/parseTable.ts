export type TRow = { [key: string] : string }

export function parseTable(str: string): TRow[] {
	const lines = str.split('\n')
	const cellLengths: number[] = []
	const names: string[] = []
	const rows: TRow[] = []
	for (let lineIndex = 0, linesCount = lines.length; lineIndex < linesCount; lineIndex++) {
		const line = lines[lineIndex]
		if (!line.trim()) {
			continue
		}

		if (names.length === 0) {
			const cells = line.split(/\b(?=\S)/)
			for (let i = 0; i < cells.length; i++) {
				const cell = cells[i]
				cellLengths.push(cell.length)
				names.push(cell.trim())
			}
			continue
		}

		const row: TRow = {}
		let strPos = 0
		for (let i = 0, len = names.length; i < len; i++) {
			const name = names[i]
			const prevStrPos = strPos
			strPos += cellLengths[i]
			const value = line.substring(prevStrPos, i === len - 1 ? void 0 : strPos)
			row[name] = value.trim()
		}

		rows.push(row)
	}

	return rows
}
