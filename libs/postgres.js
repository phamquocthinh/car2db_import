const fs = require('fs')
const path = require('path')
const csv = require('fast-csv')
const { host, port, database, user, password, schema = 'public' } = require('../config/defaultValues')

const pgp = require('pg-promise')({
    capSQL: true
})

const pgConfig = {
	host,
	port,
	database,
	user,
	password
}

const db = pgp(pgConfig)

const getTableData = (tableName) => {
	let columnNames, conflictKey

	switch (tableName) {
		case 'car_equipment':
			columnNames = ['id_car_equipment','id_car_trim','name',{
				name: 'year',
				init(col) {
					return col.value === 'NULL' ? null : col.value
				}
			},'date_create','date_update','id_car_type']

			conflictKey = 'id_car_equipment'
			break
		case 'car_generation':
			columnNames = ['id_car_generation','id_car_model','name',{
				name: 'year_begin',
				init(col) {
					return col.value === 'NULL' ? null : col.value
				}
			},{
				name: 'year_end',
				init(col) {
					return col.value === 'NULL' ? null : col.value
				}
			},'date_create','date_update','id_car_type']

			conflictKey = 'id_car_generation'
			break
		case 'car_make':
			columnNames = ['id_car_make','name','date_create','date_update','id_car_type']
			conflictKey = 'id_car_make'
			break
		case 'car_model':
			columnNames = ['id_car_model','id_car_make','name','date_create','date_update','id_car_type']
			conflictKey = 'id_car_model'
			break
		case 'car_option_value':
			columnNames = ['id_car_option_value','id_car_option','id_car_equipment','is_base','date_create','date_update','id_car_type']
			conflictKey = 'id_car_option_value'
			break
		case 'car_option':
			columnNames = ['id_car_option','name',{
				name: "id_parent",
				init(col) {
					return col.value === 'NULL' ? null : col.value
				}
			},'date_create','date_update','id_car_type']
			conflictKey = 'id_car_option'
			break
		case 'car_serie':
			columnNames = ['id_car_serie','id_car_model',{
				name: "id_car_generation",
				init(col) {
					return col.value === 'NULL' ? null : col.value
				}
			},'name','date_create','date_update','id_car_type']
			conflictKey = 'id_car_serie'
			break
		case 'car_specification_value':
			columnNames = ['id_car_specification_value','id_car_trim','id_car_specification','value','unit','date_create','date_update','id_car_type']
			conflictKey = 'id_car_specification_value'
			break
		case 'car_specification':
			columnNames = ['id_car_specification','name',{
				name: "id_parent",
				init(col) {
					return col.value === 'NULL' ? null : col.value
				}
			},'date_create','date_update','id_car_type']
			conflictKey = 'id_car_specification'
			break
		case 'car_trim':
			columnNames = ['id_car_trim',{
				name: "id_car_serie",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			},{
				name: "id_car_model",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			},'name',{
				name: "start_production_year",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			},{
				name: "end_production_year",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			},{
				name: "date_create",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			},{
				name: "date_update",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			},{
				name: "id_car_type",
				init(col) {
					return (!col.value || col.value === 'NULL') ? null : col.value
				}
			}]
			conflictKey = 'id_car_trim'
			break
		case 'car_type':
			columnNames = ['id_car_type','name']
			conflictKey = 'id_car_type'
			break
		default:
			throw new Error('Invalid table name')
	}

	return { 
		columnNames, conflictKey
	}
}

const prepairData = (tableName) => {
	const table = new pgp.helpers.TableName({table: tableName, schema})

	const { columnNames, conflictKey } = getTableData(tableName)

	const cs = new pgp.helpers.ColumnSet(columnNames, {table})
	const onConflict = ` ON CONFLICT(${conflictKey}) DO NOTHING`

	return {
		cs,
		onConflict
	}
}

const importToTable = async(db, tableName, filePath) => {
	const data = []
	const timeStart = new Date()
	const { cs, onConflict } = prepairData(tableName)

	fs.createReadStream(filePath)
		.pipe(csv.parse({ headers: true, quote: "'", delimiter: ",", escape: "\\" }))
		.on('error', error => console.error(error))
		.on('data', async(row) => {
			data.push(row)

			if (data.length > 1000) {
				let a = data.splice(0, 1000)

				const query = pgp.helpers.insert(a, cs) + onConflict
				await db.none(query)
			}
		})
		.on('end', async(rowCount) => {
			while (data && data.length) {
				let a = data.splice(0, 1000)
		
				const query = pgp.helpers.insert(a, cs) + onConflict
				await db.none(query)
			}

			const timeEnd = new Date()

			console.log(`Inserted ${rowCount} rows on ${parseInt((timeEnd - timeStart) / 1000)} seconds`)
			console.log(`Finished update ${tableName} at ${timeEnd.toLocaleString()}`)
		})	
}

module.exports = {
	db,
	importToTable
}