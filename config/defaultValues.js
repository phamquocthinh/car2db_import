const Util = require('../libs/utils')

const POSTGRES_HOST = Util.getEnv('POSTGRES_HOST', 'localhost')
const POSTGRES_PORT = Util.getEnv('POSTGRES_PORT', 5432)
const POSTGRES_DB = Util.getEnv('POSTGRES_DB', 'car')
const POSTGRES_USER = Util.getEnv('POSTGRES_USER', 'postgres')
const POSTGRES_PASS = Util.getEnv('POSTGRES_PASS', 'aa142536')

const CAR2DB_KEY = Util.getEnv('CAR2DB_KEY', '')
const SCHEMA = Util.getEnv('POSTGRES_SCHEMA', 'car')

const CAR2DB_ENTITIES = [
	"make",
	"model",
	"generation",
	"serie",
	"trim",
	"specification",
	"specificationValue",
	"equipment",
	"option",
	"optionValue"
]

module.exports = {
	host: POSTGRES_HOST,
	port: POSTGRES_PORT,
	user: POSTGRES_USER,
	password: POSTGRES_PASS,
	database: POSTGRES_DB,
	apiKey: CAR2DB_KEY,
	car2dbEntities: CAR2DB_ENTITIES,
	schema: SCHEMA
}
