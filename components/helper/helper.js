async function getTime() {
    var date = new Date();

    var day = String(date.getDate()).padStart(2, '0')
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var year = String(date.getFullYear()).slice(-2)

    var hours = String(date.getHours()).padStart(2, '0')
    var minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
}

const helper = {
    getTime
}
module.exports = helper