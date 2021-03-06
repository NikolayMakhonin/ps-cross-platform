/* eslint-disable no-shadow */
import assert from 'assert'
import {ps, psTree} from './ps'
import {spawn} from 'child_process'

describe('ps', function () {
	this.timeout(15000)

	function delay(milliseconds) {
		return new Promise(o => setTimeout(o, milliseconds))
	}

 	it('ps', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command], {
				detached: true,
				stdio: 'ignore',
				windowsHide: true,
			})
			proc.unref()
			// proc.on('error', err => {
			// 	error = err
			// })
		}

		startProc()

		await delay(1000)
		const timeStart = Date.now()
		let result = await ps()
		const duration = Date.now() - timeStart
		console.log('Duration (ms): ' + duration)
		assert.ok(duration <= 2000, 'duration=' + duration)

		if (error) {
			throw error
		}

		console.log(JSON.stringify(result, null, 4))

		assert.ok(result, 'result=' + result)
		assert.ok(result.length, 'result.length=' + result.length)
		result.forEach(item => {
			assert.ok(item, 'result item=' + item)
			assert.ok(Number.isFinite(item.pid), 'item.pid=' + item.pid)
			assert.ok(Number.isFinite(item.ppid), 'item.ppid=' + item.ppid)
			assert.ok(typeof item.command === 'string', 'item.command=' + item.command)
			// assert.ok(Array.isArray(item.argv), 'item.argv=' + item.argv)
			// item.argv.forEach(arg => {
			// 	assert.ok(typeof arg === 'string', 'arg=' + arg)
			// })
		})

		const findProcs = result.filter(o => o.command.indexOf(command) >= 0)
		assert.ok(findProcs, 'findProcs=' + findProcs)
		console.log('proc.pid=' + proc.pid)
		console.log(JSON.stringify(findProcs, null, 4))
		assert.strictEqual(findProcs.length, 1, 'findProc.length=' + findProcs.length)
		assert.strictEqual(findProcs[0].pid, proc && proc.pid)

		process.kill(findProcs[0].pid, 'SIGINT')
		await delay(1000)

		result = await ps()

		assert.ok(result.every(o => o.command.indexOf(command) < 0))
	})

 	it('psTree', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 30000)`

		let proc
		let error
		function startProc() {
			proc = spawn('node', ['-e', command], {
				detached: true,
				stdio: 'ignore',
				windowsHide: true,
			})
			proc.unref()
			// proc.on('error', err => {
			// 	error = err
			// })
		}

		startProc()

		await delay(1000)
		const timeStart = Date.now()
		let result = await psTree()
		const duration = Date.now() - timeStart
		console.log('Duration (ms): ' + duration)
		assert.ok(duration <= 2000, 'duration=' + duration)

		if (error) {
			throw error
		}

		console.log(JSON.stringify(result, null, 4))

		assert.ok(result, 'result=' + result)
		assert.ok(result instanceof Object, 'result=' + result)
		Object.keys(result).forEach(key => {
			const pid = parseInt(key)
			assert.ok(Number.isFinite(pid), 'pid=' + pid)
			const item = result[pid]
			assert.ok(item, 'result item=' + item)
			assert.ok(Number.isFinite(item.pid), 'item.pid=' + item.pid)
			assert.ok(Number.isFinite(item.ppid), 'item.ppid=' + item.ppid)
			assert.strictEqual(pid, item.pid)
			if (item.closed) {
				assert.strictEqual(item.command, '', 'item.command=' + item.command)
			} else {
				assert.ok(typeof item.command === 'string', 'item.command=' + item.command)
			}
			assert.ok(item.parentIds, 'item.parentIds=' + JSON.stringify(item.parentIds))
			if (item.pid === 0) {
				assert.deepStrictEqual(item.parentIds, [])
			} else if (item.ppid === 0) {
				assert.deepStrictEqual(item.parentIds, [0])
			} else {
				assert.ok(item.parentIds.length, 'item.parentIds=' + JSON.stringify(item.parentIds))
				assert.strictEqual(item.parentIds[0], item.ppid, 'item.parentIds=' + JSON.stringify(item.parentIds))
			}
			item.childIds.forEach(child => {
				assert.strictEqual(result[child].ppid, item.pid)
			})
			item.allChildIds.forEach(child => {
				assert.ok(result[child].parentIds.indexOf(item.pid) >= 0, 'pid=' + item.pid)
			})
			item.parentIds.forEach((parent, index) => {
				if (result[parent]) {
					if (index === 0) {
						assert.ok(result[parent].childIds.indexOf(item.pid) >= 0, 'pid=' + item.pid)
					}
					assert.ok(result[parent].allChildIds.indexOf(item.pid) >= 0, 'pid=' + item.pid)
				}
			})
			// assert.ok(Array.isArray(item.argv), 'item.argv=' + item.argv)
			// item.argv.forEach(arg => {
			// 	assert.ok(typeof arg === 'string', 'arg=' + arg)
			// })
		})

		const findProcs = Object.values(result).filter(o => o.command.indexOf(command) >= 0)
		assert.ok(findProcs, 'findProcs=' + findProcs)
		console.log('proc.pid=' + proc.pid)
		console.log(JSON.stringify(findProcs, null, 4))
		assert.strictEqual(findProcs.length, 1, 'findProc.length=' + findProcs.length)
		assert.strictEqual(findProcs[0].pid, proc && proc.pid)

		process.kill(findProcs[0].pid, 'SIGINT')
		await delay(1000)

		result = await psTree()

		assert.ok(Object.values(result).every(o => o.command.indexOf(command) < 0))
	})
})
