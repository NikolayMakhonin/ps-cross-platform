export interface IProcessIdentity {
	pid: number,
	/* Warning: it will be without quotes on unix systems */
	command: string,
}

export interface IProcess extends IProcessIdentity {
	pid: number,
	ppid: number,
	/* Warning: it will be without quotes on unix systems */
	command: string,
	// argv: string[],
}

export interface IProcessNode extends IProcess {
	parentIds: number[],
	childIds: number[],
	allChildIds: number[],
}

export type IProcessTree = {
	[pid: number]: IProcessNode
}
