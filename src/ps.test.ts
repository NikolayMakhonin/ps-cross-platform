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
 		const command = `setTimeout(function() { console.log('Completed') }, 50000)`
		const proc = spawn('node', ['-e', command])

		let error
		proc.on('error', err => {
			error = err
		})

		await delay(1000)
		const timeStart = Date.now()
		const result = await ps()
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
		// assert.ok(result.some(o => o.argv[2] === command))
		assert.ok(result.some(o => o.command.indexOf(command) >= 0))

		proc.kill('SIGTERM')
	})

 	it('psTree', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 50000)`
		const proc = spawn('node', ['-e', command])

		let error
		proc.on('error', err => {
			error = err
		})

		await delay(1000)
		const timeStart = Date.now()
		const result = await psTree()
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
			assert.ok(typeof item.command === 'string', 'item.command=' + item.command)
			item.childs.forEach(child => {
				assert.strictEqual(result[child].ppid, item.pid)
			})
			item.parents.forEach((parent, index) => {
				if (result[parent]) {
					if (index === 0) {
						assert.ok(result[parent].childs.indexOf(item.pid) >= 0, 'pid=' + item.pid)
					}
					assert.ok(result[parent].allChilds.indexOf(item.pid) >= 0, 'pid=' + item.pid)
				}
			})
			// assert.ok(Array.isArray(item.argv), 'item.argv=' + item.argv)
			// item.argv.forEach(arg => {
			// 	assert.ok(typeof arg === 'string', 'arg=' + arg)
			// })
		})
		// assert.ok(result.some(o => o.argv[2] === command))
		assert.ok(Object.values(result).some(o => o.command.indexOf(command) >= 0))

		proc.kill('SIGTERM')
	})
})
