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

	function fillParents(process: TProcessNode): number[] {
		if (!process.parentIds) {
			if (process.ppid === 0) {
				process.parentIds = []
			} else {
				const parent = processesTree[process.ppid]
				process.parentIds = []
				process.parentIds = parent
					? [process.ppid, ...fillParents(parent)]
					: [process.ppid]
			}
			process.childIds = []
			process.allChildIds = []
		}
		return process.parentIds
	}

	// fill parents
	for (let i = 0, len = processes.length; i < len; i++) {
		fillParents(processes[i] as TProcessNode)
	}

	// fill childs
	for (let i = 0, len = processes.length; i < len; i++) {
		const process = processes[i]
		const pid = process.pid
		const parentIds = (process as TProcessNode).parentIds
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
