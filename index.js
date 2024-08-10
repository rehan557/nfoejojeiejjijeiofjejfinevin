const { bot1, bot2 } = require('./main.js')
const variables = require('./variables.js')

bot1.initialize()
bot2.initialize()

// CLIENT READY HANDLER
bot1.once('ready', () => {
    console.log(`Client 1 is ready!`)
})

bot2.once('ready', () => {
    console.log(`Client 2 is ready!`)
    bot2.sendMessage(`${variables.phone[0]}@c.us`, `*Server online!*\nSemua proses dilanjutkan.`)
})

// LOADING SCREEN HANDLER
bot1.on('loading_screen', percent => {
    console.log(`LOADING CLIENT 1 - ${percent}`)
})

bot2.on('loading_screen', percent => {
    console.log(`LOADING CLIENT 2 - ${percent}`)
})

// QR CODE AND PAIRING CODE HANDLER
bot1.on('qr', async () => {
    console.log('PARING CODE UNTUK CLIENT 1', await bot1.requestPairingCode(variables.phone[0]))
})

bot2.on('qr', async () => {
    console.log('PARING CODE UNTUK CLIENT 2', await bot2.requestPairingCode(variables.phone[1]))
})

bot1.on('change_state', (state) => {
    console.log(`PERUBAHAN STATE CLIENT 1 - ${state}`)
})

bot2.on('change_state', (state) => {
    console.log(`PERUBAHAN STATE CLIENT 2 - ${state}`)
})

module.exports = { bot1, bot2 }