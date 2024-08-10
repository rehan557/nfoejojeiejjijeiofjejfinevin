const variables = require('../../variables.js')

async function getTime() {
    var date = new Date();

    var day = String(date.getDate()).padStart(2, '0')
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var year = String(date.getFullYear()).slice(-2)

    var hours = String(date.getHours()).padStart(2, '0')
    var minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
}

async function afkMsg(bot, text, prop, key, ctx) {
    var timers = {}

    if (!prop.get(key + ctx.from)) {
        await bot.sendMessage(ctx.from, pesan)
        prop.set(key + ctx.from)
        var time = 20
        var ints = timers[ctx.from] = setInterval(() => {
            time--;

            if (time <= 0) {
                clearInterval(ints)
                prop.read(key + ctx.from)
            }
        }, 1000)
        return
    }
}

const helper = {
    getTime,
    afkMsg
}
module.exports = helper