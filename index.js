const variables = require('./variables.js')
const helper = require('./components/helper/helper.js')
const proper = require('properties-reader')
const prop = proper('')
const { connectToWhatsApp } = require('./main.js')
const timers = {}

async function handler() {
    var sock1 = await connectToWhatsApp(1, './session/client-1', variables.phone[0])
    var sock2 = await connectToWhatsApp(2, './session/client-2', variables.phone[1])

    sock1.ev.removeAllListeners(`messages.upsert`)
    sock2.ev.removeAllListeners(`messages.upsert`)
    sock1.ev.removeAllListeners(`call`)
    sock2.ev.removeAllListeners(`call`)

    sock1.ev.on(`messages.upsert`, async (message) => {
        var msg = message.messages[0]
        var from = msg.key.remoteJid;
        var isGroup = from.endsWith('@g.us')

        if (isGroup == true) return
        await sock2.readMessages([ msg.key ])
        if (from == `${variables.phone[1]}@s.whatsapp.net`) return true
        if (msg.key.fromMe) {
            if (prop.get(`status_` + variables.phone[0]) == 'off') {
                prop.read(`status_` + variables.phone[0])
                var pesan = `✅ *Online!*\nAnda telah kembali dari AFK.`
                await sock2.sendMessage(`${variables.phone[0]}@s.whatsapp.net`, { text: pesan })
            }
        }
        var status = prop.get(`status_` + variables.phone[0])

        if (status == 'off') {
            var time = prop.get(`time_` + variables.phone[0])
            var pesan = `👋 *Halo ${msg.pushName}!*`
            pesan += `\nAnda baru-baru saja menghubungi ${variables.phone[0]} yang saat ini tidak tersedia, Anda akan mendapat pesan balasan saat dia kembali online. Terimakasih!`
            pesan += `\n⏳ AFK sejak: ${time}.`

            await helper.sendMsg(sock2, pesan, prop, 'has_sent_afk_', from, msg)
        }
        return
    })

    sock2.ev.on(`messages.upsert`, async (message) => {
        var msg = message.messages[0]
        if (msg.key.fromMe) return
        var from = msg.key.remoteJid;
        var isGroup = from.endsWith('@g.us')

        if (isGroup == true) return
        var messageContent = msg.message.conversation ? msg.message.conversation : msg.message.extendedTextMessage?.text;

        await sock2.readMessages([ msg.key ])
        if (from == `${variables.phone[1]}@s.whatsapp.net`) return true
        if (from !== `${variables.phone[0]}@s.whatsapp.net`) {
            if (!prop.get(`sended_call_` + from)) {
                await helper.sendMsg(sock2, `Sorry! ${variables.bwMsg}`, prop, `has_sent_bw_`, from, msg)
            } else {
                prop.read(`sended_call_` + from)
            }
            return;
        }

        var pola = /(off|afk)/i
        if (pola.exec(messageContent)) {
            if (prop.get(`status_` + variables.phone[0]) == 'off') {
                var pesan = `🌡 *Status*`
                pesan += `\nAnda sedang AFK sejak ${prop.get(`time_` + variables.phone[0])}`
            } else {
                var pesan = `✅ *Success!*\nStatus berhasil diubah ke AFK.`
            }

            await sock2.sendMessage(from, { text: pesan })
            prop.set(`status_` + variables.phone[0], 'off')
            prop.set(`time_` + variables.phone[0], await helper.getTime())
        }

        var pola = /(off|afk)/i
        if (!pola.exec(messageContent)) {
            if (prop.get(`status_` + variables.phone[0]) == 'off') {
                prop.read(`status_` + variables.phone[0])
                var pesan = `✅ *Online!*\nAnda telah kembali dari AFK.`
            } else {
                var pesan = `❌ *Rejected!*\nAnda tidak AFK sama sekali, untuk AFK kirimkan "off" atau "afk".`
            }
            await sock2.sendMessage(from, { text: pesan })
        }
        return;
    })

    var callTime = variables.awaitTime;
    var code = `sent_call2_`

    sock1.ev.on(`call`, async (caller) => {
        if (prop.get(`status_` + variables.phone[0]) == 'off') {
            var call = caller[0]
            var callID = call.id
            var from = call.chatId

            await sock1.rejectCall(callID, from)
            if (!prop.get(code + from)) {
                prop.set(code + from, true)
                prop.set(`sended_call_` + from, `call`)
                var pesan = `⚠️ *Warning!*`
                pesan += `\n${variables.phone[0]} tidak tersedia untuk saat ini, cobalah untuk menghubunginya kembali nanti. Terimakasih!`
                await sock2.sendMessage(from, { text: pesan })
                var ints = timers[from] = setInterval(() => {
                    callTime--;

                    if (callTime <= 0) {
                        clearInterval(ints)
                        prop.read(code + from)
                    }
                }, 1000);
            }
        }
        return
    })

    sock2.ev.on(`call`, async (caller) => {
        var call = caller[0]
        var callID = call.id
        var from = call.chatId

        await sock2.rejectCall(callID, from)
        if (!prop.get(code + from)) {
            prop.set(code + from, true)
            prop.set(`sended_call_` + from, `call`)
            var pesan = `⚠️ *Warning!*`
            pesan += `\nDo not call this bot. ${variables.bwMsg}`
            await sock2.sendMessage(from, { text: pesan })
            var ints = timers[from] = setInterval(() => {
                callTime--;

                if (callTime <= 0) {
                    clearInterval(ints)
                    prop.read(code + from)
                }
            }, 1000);
        }
        return
    })
}

handler()