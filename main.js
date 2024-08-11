const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino').default;

const fs = require('fs');
const logger = pino(fs.createWriteStream('./logs.txt'));

async function connectToWhatsApp(clientNumber, authFolder, phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        markOnlineOnConnect: true,
        logger: logger,
        defaultQueryTimeoutMs: undefined
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'connecting') {
            if (qr) {
                console.log(`QR UNTUK CLIENT ${clientNumber}`)
            } else {
                console.log(`MENGHUBUNGKAN CLIENT ${clientNumber}...`)
            }
        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`Client ${clientNumber} terputus, mencoba reconnect...`, shouldReconnect);

            if (shouldReconnect) {
                connectToWhatsApp(clientNumber, authFolder, phoneNumber);
            } else {
                console.log(`Client ${clientNumber} logged out.`);
                fs.rmdirSync(authFolder, { recursive: true });
            }
        } else if (connection === 'open') {
            console.log(`Koneksi berhasil dibuka untuk Client ${clientNumber}`);
        }
    });

    return sock;
}
module.exports = { connectToWhatsApp }