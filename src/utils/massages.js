const generateMessages = (username, text) => {
    return {
        username,
        text,
        createAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createAt: new Date().getTime()

    }
}

module.exports = {
    generateMessages,
    generateLocationMessage
}