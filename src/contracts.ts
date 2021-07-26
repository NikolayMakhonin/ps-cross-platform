export interface TProcessIdentity {
	pid: number,
	/* Warning: it will be without quotes on unix systems */
	command: string,
}

export interface TProcess extends TProcessIdentity {
	pid: number,
	ppid: number,
	/* Warning: it will be without quotes on unix systems */
	command: string,
	// argv: string[],
}

export interface TProcessNode extends TProcess {
	parentIds: number[],
	childIds: number[],
	allChildIds: number[],
}

export type TProcessTree = {
	[pid: number]: TProcessNode
}
