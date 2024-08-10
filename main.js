const { Client, LocalAuth } = require('whatsapp-web.js')
const proper = require('properties-reader')
const variables = require('./variables')
const helper = require('./components/helper/helper.js')

const prop = proper('')
const bot1 = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session/client1',
        clientId: 'client-1'
    })
})
const bot2 = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session/client2',
        clientId: 'client-2'
    })
})
const timers = {}

bot1.on(`message_create`, async (ctx) => {
    var chat = await ctx.getChat()

    if (chat.isGroup == false) {
        if (ctx.fromMe == false || ctx.to == `${variables.phone[1]}@c.us`) return
        if (prop.get(`status_` + variables.phone[0]) == 'off') {
            prop.read(`status_` + variables.phone[0])
            prop.read(`time_` + variables.phone[0])
            bot2.sendMessage(ctx.from, `✅ *Online!*\nAnda telah kembali online.`)
        }
    }
    return;
})

bot1.on(`message`, async (ctx) => {
    var chat = await ctx.getChat()

    if (chat.isGroup == false) {
        var status = prop.get(`status_` + variables.phone[0])

        if (status == 'off') {
            if (!prop.get(`has_sent_` + ctx.from)) {
                var times = prop.get(`time_` + variables.phone[0])

                var pesan = `👋 *Halo ${ctx._data.notifyName}!*`
                pesan += `\nAnda baru saja menghubungi ${variables.phone[0]} yang saat ini tidak tersedia, tunggulah beberapa saat. Terimakasih!`
                pesan += (times !== null) ? `\n⏳ AFK sejak: ${times}` : ``

                await bot2.sendMessage(ctx.from, pesan)
                prop.set(`has_sent_` + ctx.from)
                var time = 20
                var ints = timers[ctx.from] = setInterval(() => {
                    time--;

                    if (time <= 0) {
                        clearInterval(ints)
                        prop.read(`has_sent_` + ctx.from)
                    }
                }, 1000)
                return
            }
        }
    }
    return
})

bot2.on(`call`, async (ctx) => {
    await ctx.reject()
    await bot2.sendMessage(ctx.from, `⚠️ *Warning!*\nDo not call this bot. ${variables.bwMsg}`)
    return;
})

bot2.on(`message`, async (ctx) => {
    var chat = await ctx.getChat()

    if (chat.isGroup == false) {
        if (ctx.from !== `${variables.phone[0]}@c.us`) await bot2.sendMessage(ctx.from, `Sorry! ${variables.bwMsg}`)

        var pola = /afk$/i
        if (pola.exec(ctx.body)) {
            prop.set(`status_` + variables.phone[0], 'off')
            prop.set(`time_` + variables.phone[0], await helper.getTime())
            return await bot2.sendMessage(ctx.from, `✅ *Success!*\nBerhasil mengatur status menjadi AFK.`)
        }

        var pola = /^\/cek$/i
        if (pola.exec(ctx.body)) {
            var status = prop.get(`status_` + variables.phone[0])
            var time = prop.get(`time_` + variables.phone[0])

            var pesan = `🌡 *Status*\n${(status == 'off') ? `Saat ini Anda sedang AFK.\n⏳ AFK sejak: ${time}` : `Anda sedang online.`}`
            return await bot2.sendMessage(ctx.from, pesan)
        }
    }
    return
})

module.exports = { bot1, bot2 }