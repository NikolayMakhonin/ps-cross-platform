/* eslint-disable no-shadow */
import assert from 'assert'
import {parseTable} from './parseTable'

describe('parseTable', function () {
	this.timeout(1000)

	it('base', async function () {
		const result = parseTable({
			columnDefault: {
				align: 'right',
			},
			columns: {
				FIELD_3: {
					align: 'left'
				},
			},
			filter(line) {
				return !/^\s*\[/.test(line)
			},
			text: `

         Field1         field2 FIELD_3
Value  1       value  1        VALUE  1   
         Value2         value2           VALUE_2
        
    
         Value3value3          VALUE_3      
  [+]   
     
`
	})

		assert.deepStrictEqual(result, [
			{Field1: 'Value  1', field2: 'value  1', FIELD_3: 'VALUE  1', },
			{Field1: 'Value2', field2: 'value2', FIELD_3: 'VALUE_2', },
			{Field1: 'Value3', field2: 'value3', FIELD_3: 'VALUE_3', },
		])
	})
})
