
## Installation

Requires [Node.js](https://nodejs.org/) v10+ to run.

Add `.env` file (example: `.env.example`)

```sh
CAR2DB_KEY=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=car
POSTGRES_USER=postgres
POSTGRES_PASS=aa142536
POSTGRES_SCHEMA=car
```

### How to run
```sh
cd path_of_car2db_import
node scripts/checkUpdate.js
```
### Use crontab
```sh
crontab -e //create or edit cronjob
```
Add line below then save and exit:
```
0 0 1 */1 * cd path_of_car2db_import && node scripts/checkUpdate.js
```
That cron will run at 00h00' every first day of a month.