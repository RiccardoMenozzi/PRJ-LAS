const {notFound} = require("./utils")
const express = require("express")
const join = require("path").join
const jwt = require('jsonwebtoken')
const configs = require("./configs")
const UsersComponent = require("./UsersComponent")
const EmailComponent = require("./EmailComponent")


const app = new express()
const usersComponent = new UsersComponent("./state.json")
const emailComponent = new EmailComponent()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(join(__dirname, "../public")))

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/home.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/login.html"))
})

app.post("/login", async (req, res) => {
    const result = await usersComponent.login(req.body.email, req.body.password)
    if (result.success) {
        res.json(result)
    } else {
        res.status(400).json(result)
    }
})

app.get("/signup", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/signup.html"))
})

app.post("/signup", async (req, res) => {
    const result = await usersComponent.create(req.body)
    if (result.success) {
        const user = result.user
        usersComponent.setUserToken(user.email)
        emailComponent.sendEmail(user.email, "verify-email", user.token)
        res.redirect(`/signup-confirmation?email=${encodeURIComponent(user.email)}`)
    } else {
        res.status(400).json(result)
    }
})

app.get("/welcome", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/welcome.html"))
})

app.get('/signup-confirmation', async (req, res) => {
    res.sendFile(join(__dirname, "../public/html/signupConfirmation.html"))
})

app.get('/verify-email', async (req, res) => {
    const { token } = req.query

    try {
        const decoded = jwt.verify(token, configs.JWT_SECRET) 
        const email = decoded.email

        const user = usersComponent.getUser(email)

        if (!user) {
            return res.redirect(`/verified-email?status=invalid`)
        }

        if (user.verified) {
            usersComponent.invalidateUserToken(email)
            return res.redirect(`/verified-email?status=already_verified&email=${encodeURIComponent(user.email)}`)
        }

        if (user.token !== token) {
            return res.redirect(`/verified-email?status=invalid&email=${encodeURIComponent(user.email)}`)
        }

        usersComponent.updateVerificationStatus(email, true)

        return res.redirect(`/verified-email?status=success&email=${encodeURIComponent(user.email)}`)
    } catch (error) {
        // Se il token è scaduto, prova a decodificarlo senza verificare
        let email = null
        if (error.name === "TokenExpiredError") {
            const decoded = jwt.decode(token)  // Decodifica il token senza verificare
            email = decoded?.email
        }

        if (email) {
            //New token and new mail
            const newToken = jwt.sign({ email }, configs.JWT_SECRET, { expiresIn: '1h' })
            usersComponent.setUserToken(email, newToken)
            emailComponent.sendEmail(email, "verify-email", newToken)

            return res.redirect(`/verified-email?status=resent&email=${encodeURIComponent(email)}`)
        }

        return res.redirect(`/verified-email?status=invalid`)
    }
})

app.get("/verified-email", (req, res) => {
    res.sendFile(join(__dirname, "../public/html/verifiedEmail.html"))
})

app.post("/resend-email", async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ success: false, message: "Email required" })
    }

    const user = usersComponent.getUser(email)
    if (!user) {
        return res.status(404).json(notFound)
    }

    if (user.verified) {
        return res.status(400).json({ success: false, message: "Email already verified"})
    }

    usersComponent.setUserToken(user.email)
    emailComponent.sendEmail(user.email, "verify-email", user.token)

    return res.json({ success: true, user, message: "Email resent successfully!" })
})

app.get('/forgot-password', async (req, res) => {
    res.sendFile(join(__dirname, "../public/html/forgotPassword.html"))
})

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: "Email required" })
    }

    const user = usersComponent.getUser(email)

    if (!user || !user?.verified) {
        return res.status(400).json(notFound)
    }

    usersComponent.setUserToken(email)
    emailComponent.sendEmail(email, "reset-password", user.token)

    return res.json({ success: true, message: "Email sent successfully" })
})

app.get('/reset-password', async (req, res) => {
    const { token } = req.query

    try {
        const decoded = jwt.verify(token, configs.JWT_SECRET)
        const email = decoded.email

        const user = usersComponent.getUser(email)

        if (!user) res.status(404).json(notFound)

        if (user.token !== token) {
            return res.status(400).json({ success: false, message: "Link non valido o già usato" })
        }

        res.sendFile(join(__dirname, "../public/html/resetPassword.html"))
    } catch (error) {
        res.status(400).send('Link non valido o scaduto.')
    }
})

app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body

    try {
        const decoded = jwt.verify(token, configs.JWT_SECRET)
        const email = decoded.email

        const user = usersComponent.getUser(email)
        if (!user) {
            return res.status(400).json(notFound)
        }

        if (user.token !== token) {
            return res.status(400).json({ success: false, message: "Invalid link" })
        }

        usersComponent.updateUserPassword(email, password)

        res.json({ success: true, message: "Password Changed" })
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid link" })
    }
})

app.use((req, res) => {res.sendFile(join(__dirname, "../public/html/404.html"))}) //404 endpoint not found

app.listen(configs.PORT, configs.SITE_URL, () => console.log("server listening on port", configs.PORT))