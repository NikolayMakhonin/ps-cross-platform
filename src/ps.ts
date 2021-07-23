import {TProcess, TProcessNode, TProcessTree} from './contracts'
import {psUnix} from './ps-unix-old'
import {wmic} from './wmic'

export function ps(): Promise<TProcess[]> {
	return process.platform === 'win32' ? wmic() : psUnix()
}

export async function psTree(): Promise<TProcessTree> {
	const processes = await ps()
	return getProcessTree(processes)
}

function getProcessTree(processes: TProcess[]): TProcessTree {
	const processesTree: TProcessTree = processes.reduce((a, o) => {
		a[o.pid] = o
		return a
	}, {})

	function fillParents(proc: TProcessNode): number[] {
		if (!proc.parentIds) {
			if (proc.ppid === 0) {
				proc.parentIds = []
			} else {
				const parent = processesTree[proc.ppid]
				// proc.parentIds = []
				proc.parentIds = parent
					? [proc.ppid, ...fillParents(parent)]
					: [proc.ppid]
			}
			proc.childIds = []
			proc.allChildIds = []
		}
		return proc.parentIds
	}

	// fill parents
	for (let i = 0, len = processes.length; i < len; i++) {
		fillParents(processes[i] as TProcessNode)
	}

	// fill childs
	for (let i = 0, len = processes.length; i < len; i++) {
		const proc = processes[i]
		const pid = proc.pid
		const parentIds = (proc as TProcessNode).parentIds
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
