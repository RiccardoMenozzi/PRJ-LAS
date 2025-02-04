const nodemailer = require('nodemailer')
const configs = require("./configs")
const join = require("path").join
const fs = require('fs')

class EmailComponent {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: configs.EMAIL, 
                pass: configs.EMAIL_PASSWORD
            }
        })
    }

    loadTemplate(templateName, replacements) {
        const templatePath = join(__dirname, '../email_templates', `${templateName}.html`)
        let template = fs.readFileSync(templatePath, 'utf8')
    
        // Sostituisce i placeholder con i valori reali
        Object.keys(replacements).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g')
            template = template.replace(regex, replacements[key])
        })
    
        return template
    }
    
    async sendEmail(to, root, token) {
        const url = `http://${configs.SITE_HOST}:${configs.PORT}/${root}?token=${token}`
        const htmlContent = this.loadTemplate((root === 'verify-email')? 'confirmation_email' : 'reset_password_email' , { url: url })
    
        const mailOptions = {
            from: `"LS-Project" <${configs.EMAIL}>`,
            to: to,
            subject: 'Conferma la tua email',
            html: htmlContent
        }
    
        try {
            const x = await this.transporter.sendMail(mailOptions)
            console.log("X; " , x)
        } catch (error) {
            console.error('Errore nell’invio dell’email:', error)
        }
    }

}

module.exports = EmailComponent
