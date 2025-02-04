const fs = require("fs")
const bcrypt = require("bcrypt")
const { generateToken, hashPassword } = require("./utils")

class UsersComponent {
    constructor(statePath) {
        this.users = []
        this.statePath = statePath
        try {
            this.users = JSON.parse(fs.readFileSync(statePath, "utf-8"))
        } catch(err) {
            console.log(err.message)
            this.serialize()
        }
    }

    serialize() {
        fs.writeFileSync(this.statePath, JSON.stringify(this.users, null, 2))
    }

    getUser(email) {
        return this.users.find(u => u.email === email)
    }

    setUserToken(email) {
        const user = this.getUser(email)

        if (!user) {
            return { success: false, message: "Utente non trovato" }
        }

        const token = generateToken(email)
        user.token = token
        this.serialize()

        return { success: true, message: "Token impostato con successo" }
    }

    invalidateUserToken(email) {
        const user = this.getUser(email)

        if (!user) {
            return { success: false, message: "Utente non trovato" }
        }

        user.token = null
        this.serialize()

        return { success: true, message: "Token invalidato con successo" }
    }

    async updateUserPassword(email, password) {
        const user = this.getUser(email)

        if (!user) {
            return { success: false, message: "Utente non trovato" }
        }

        user.password = await hashPassword(password)
        this.serialize()
        
        return { success: true, message: "Password impostata con successo" }
    }
    
    updateVerificationStatus(email, verified) {
        const user = this.getUser(email)
        if (!user) {  
            return { success: false, message: "Utente non trovato" }
        }

        user.verified = verified
        user.token = null
        this.serialize()

        return { success: true, message: "Verification status updated" }
    }

    async create(data) {
        const { email, password } = data

        if (this.getUser(email)) {
            return { success: false, message: "Email già in uso" }
        }

        const user = {
            email, 
            password: await hashPassword(password),
            token : null,
            verified: false 
        }

        this.users.push(user)
        this.serialize()
        
        return { success: true, user, message: "Utente creato con successo. Controlla la tua email per la conferma." }
    }

    async login(email, password) {
        const user = this.getUser(email)

        if (!user) {
            return { success: false, message: "Utente non trovato" }
        }

        if (!user.verified) {
            return { success: false, user, message: "Email non verificata. Controlla la tua posta." }
        }

        if (await bcrypt.compare(password, Buffer.from(user.password, 'base64').toString('utf-8'))) {
            return { success: true, user, message: "Login riuscito" }
        }

        return { success: false, user, message: "Password errata" }
    }

}

module.exports = UsersComponent
