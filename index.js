const { bot1, bot2 } = require('./main.js')
const variables = require('./variables.js')

// CLIENT READY HANDLER
bot1.once('ready', () => {
    console.log(`Client 1 is ready!`);
});

bot2.once('ready', () => {
    console.log(`Client 2 is ready!`);
    bot2.sendMessage(`${variables.phone[0]}@c.us`, `*Server online!*\nSemua proses dilanjutkan.`);
});

// LOADING SCREEN HANDLER
bot1.on('loading_screen', percent => {
    console.log(`LOADING CLIENT 1 - ${percent}`);
});

bot2.on('loading_screen', percent => {
    console.log(`LOADING CLIENT 2 - ${percent}`);
});

// QR CODE AND PAIRING CODE HANDLER
bot1.on('qr', async () => {
    const pairingCode1 = await bot1.requestPairingCode(variables.phone[0]);
    console.log('PAIRING CODE UNTUK CLIENT 1', pairingCode1);
});

bot2.on('qr', async () => {
    const pairingCode2 = await bot2.requestPairingCode(variables.phone[1]);
    console.log('PAIRING CODE UNTUK CLIENT 2', pairingCode2);
});

bot1.initialize();
bot2.initialize();

module.exports = { bot1, bot2 }