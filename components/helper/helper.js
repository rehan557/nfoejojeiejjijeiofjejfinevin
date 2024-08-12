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

async function timeAgo(dateString) {
    var [day, month, year, hrs, mnts] = dateString.match(/\d+/g).map(Number);
    var fullYear = 2000 + year;
    var date = new Date(fullYear, month - 1, day, hrs, mnts);
    var rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
    var now = new Date();
    var seconds = Math.round((now - date) / 1000);
    
    if (seconds < 60) {
        return rtf.format(-seconds, 'second');
    }

    var minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return rtf.format(-minutes, 'minute');
    }

    var hours = Math.round(minutes / 60);
    if (hours < 24) {
        return rtf.format(-hours, 'hour');
    }

    var days = Math.round(hours / 24);
    if (days < 30) {
        return rtf.format(-days, 'day');
    }

    var months = Math.round(days / 30);
    if (months < 12) {
        return rtf.format(-months, 'month');
    }

    var years = Math.round(days / 365);
    return rtf.format(-years, 'year');
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
    sendMsg,
    timeAgo
}
module.exports = helper