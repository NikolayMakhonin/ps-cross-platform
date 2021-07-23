/* eslint-disable no-shadow */
import assert from 'assert'
import {ps} from './ps'
import {spawn} from 'child_process'

describe('ps', function () {
	this.timeout(15000)

	function delay(milliseconds) {
		return new Promise(o => setTimeout(o, milliseconds))
	}

 	it('base', async function () {
 		const command = `setTimeout(function() { console.log('Completed') }, 50000)`
		const proc = spawn('node', ['-e', command])

		let error
		proc.on('error', err => {
			error = err
		})

		await delay(1000)
		const result = await ps()

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
			assert.ok(Array.isArray(item.argv), 'item.argv=' + item.argv)
			item.argv.forEach(arg => {
				assert.ok(typeof arg === 'string', 'arg=' + arg)
			})
		})
		assert.ok(result.some(o => o.argv[2] === command))

		proc.kill('SIGTERM')
	})
})
