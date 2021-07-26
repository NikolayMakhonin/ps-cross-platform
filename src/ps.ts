import {IProcess, IProcessNode, IProcessTree} from './contracts'
import {psUnix} from './ps-unix-old'
import {wmic} from './wmic'

export function ps(): Promise<IProcess[]> {
	return process.platform === 'win32' ? wmic() : psUnix()
}

export async function psTree(): Promise<IProcessTree> {
	const processes = await ps()
	return getProcessTree(processes)
}

function getProcessTree(processes: IProcess[]): IProcessTree {
	const processesTree: IProcessTree = processes.reduce((a, o) => {
		a[o.pid] = o
		return a
	}, {})

	const _processes = Object.values(processesTree)

	function fillParents(proc: IProcessNode): number[] {
		if (!proc.parentIds) {
			if (proc.ppid === 0) {
				proc.parentIds = []
			} else {
				const parent = processesTree[proc.ppid]
				proc.parentIds = []
				proc.parentIds = parent
					? [proc.ppid, ...fillParents(parent)]
					: [proc.ppid]
			}
		}
		return proc.parentIds
	}

	// fill parents
	for (let i = 0, len = _processes.length; i < len; i++) {
		const proc = _processes[i] as IProcessNode
		fillParents(proc)
		proc.childIds = []
		proc.allChildIds = []
	}

	// fill childs
	for (let i = 0, len = _processes.length; i < len; i++) {
		const proc = _processes[i]
		const pid = proc.pid
		const parentIds = (proc as IProcessNode).parentIds
		for (let j = 0, len2 = parentIds.length; j < len2; j++) {
			const parent = processesTree[parentIds[j]]
			if (parent) {
				if (j === 0) {
					parent.childIds.push(pid)
				}
				parent.allChildIds.push(pid)
			}
		}
	}

	return processesTree
}
