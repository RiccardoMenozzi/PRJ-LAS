const jwt = require('jsonwebtoken')
const configs = require("./configs")
const bcrypt = require("bcrypt")

function generateToken(email) {
    return jwt.sign({ email }, configs.JWT_SECRET, { expiresIn: '1h' })
}

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const base64HashedPassword = Buffer.from(hashedPassword).toString('base64')

    return base64HashedPassword
}

module.exports = {
    generateToken,
    hashPassword
}