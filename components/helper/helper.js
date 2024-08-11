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

async function sendMsg(sock, text, prop, key, from, msg) {
    var timers = {}

    await sock.readMessages([ msg.key ])
    if (!prop.get(key + from)) {
        await sock.sendMessage(from, { text: text })
        prop.set(key + from)
        var time = variables.awaitTime
        var ints = timers[from] = setInterval(() => {
            time--;

            if (time <= 0) {
                clearInterval(ints)
                prop.read(key + from)
            }
        }, 1000)
        return;
    }
}

const helper = {
    getTime,
    sendMsg
}
module.exports = helper