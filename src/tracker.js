const request =require('request')
const fs = require('fs')
const path = require('path')
const colors = require('colors/safe')
let db = require('diskdb').connect(path.join(__dirname, '..', 'db'), ['main'])

if (!fs.existsSync(path.join(__dirname, '..', 'db'))) fs.mkdirSync(path.join(__dirname, '..', 'db'))
let config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'config.json')))

function main () {
  request.get(`https://ethermine.org/api/miner_new/${config.address}`, (err, res, body) => {
    if (err) throw err
    let reqDate = new Date()
    let jsonBody

    try { jsonBody = JSON.parse(body) }
    catch (err) {
      console.error(body)
      if (err) throw err
    }

    if (!jsonBody.avgHashrate) console.log(colors.red('WARNING > Average Hashrate for the current address is 0! Please double check the address. If the address hasn\'t been mined on yet, you can safely ignore this message.'))

    db.main.save({
      time: reqDate,
      timeMonth: reqDate.getMonth() + 1,
      timeDay: reqDate.getDate(),
      timeYear: reqDate.getFullYear(),
      timeHour: reqDate.getHours(),
      timeMinutes: reqDate.getMinutes(),
      timeSeconds: reqDate.getSeconds(),
      address: jsonBody.address,
      hashRate: jsonBody.hashRate,
      reportedHashRate: jsonBody.reportedHashRate,
      workers: jsonBody.workers
    })

    console.log(`[${reqDate.getMonth() + 1}/${reqDate.getDate()}/${reqDate.getFullYear()} - ${reqDate.getHours()}:${reqDate.getMinutes()}:${reqDate.getSeconds()}] LOG >> Successfully added miner entry to db.main.`)
  })

  setTimeout(() => { main() }, 1800000)
}

main()
