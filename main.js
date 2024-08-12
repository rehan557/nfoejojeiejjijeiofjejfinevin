const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino').default;
const NodeCache = require('node-cache')
const fs = require('fs');
const variables = require('./variables');

const logger = pino(fs.createWriteStream('./logs.txt'));

async function connectToWhatsApp(clientNumber, authFolder, phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCounterCache = new NodeCache()

    const sock = makeWASocket({
        version,
        auth: state,
        keepAliveIntervalMs: 50000,
        printQRInTerminal: false,
        logger: logger,
        browser: ['ubuntu', 'chrome', ''],
        generateHighQualityLinkPreview: true,
        msgRetryCounterCache: msgRetryCounterCache,
        syncFullHistory: true,
        emitOwnEvents: true,
        defaultQueryTimeoutMs: 0
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            if (!sock.authState.creds.registered) {
                console.log(`Memproses klien ${clientNumber}...`)
                setTimeout(async () => {
                    const pairCode = await sock.requestPairingCode(phoneNumber.trim());
                    console.log(`Pairing code untuk klien ${clientNumber} (${phoneNumber}) = ${pairCode}`)
                }, 5000);
            } else {
                console.log(`Menghubungkan klien ${clientNumber}...`)
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

    sock.ev.removeAllListeners('messages.upsert')
    sock.ev.removeAllListeners('call')

    return sock;
}

module.exports = { connectToWhatsApp }