export type TProcess = {
	pid: number,
	ppid: number,
	/* Warning: it will be without quotes on unix systems */
	command: string,
	// argv: string[],
}

export interface TProcessNode extends TProcess {
	parents: number[],
	childs: number[],
	allChilds: number[],
}

export type TProcessTree = {
	[pid: number]: TProcessNode
}
