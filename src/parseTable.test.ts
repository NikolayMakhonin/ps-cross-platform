/* eslint-disable no-shadow */
import assert from 'assert'
import {parseTable} from './parseTable'

describe('parseTable', function () {
	this.timeout(1000)

	it('base', async function () {
		const result = parseTable(`

Field1     field2         FIELD_3

Value1        value1           VALUE_1   
    Value2 value2         VALUE_2
    
    
    
     Value3value3         VALUE_3      
     
Value4              value4VALUE_4   
     Value5         value5               VALUE_5
     
     
`)

		assert.deepStrictEqual(result, [
			{Field1: 'Value1', field2: 'value1', FIELD_3: 'VALUE_1', },
			{Field1: 'Value2', field2: 'value2', FIELD_3: 'VALUE_2', },
			{Field1: 'Value3', field2: 'value3', FIELD_3: 'VALUE_3', },
			{Field1: 'Value4', field2: 'value4', FIELD_3: 'VALUE_4', },
			{Field1: 'Value5', field2: 'value5', FIELD_3: 'VALUE_5', },
		])
	})
})
