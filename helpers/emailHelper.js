const path = require('path')
const nodemailer = require('nodemailer')
const Email = require('email-templates')
const mongoose = require('mongoose')
const Drinker = mongoose.model('Drinker')

const newEvent = (event) => {
  return Drinker.find({ inMailList: { $ne: false } })
    .then(drinkers => {
      const email = new Email()

      // transform timestamp to human readable date
      const date = new Date(event.when)
      event.humanDate = `${date.getUTCDate()} / ${date.getMonth()}`

      email
      .renderAll('event', {
        event,
        clientURI: process.env.CLIENT_URI,
        mailListUri: `${process.env.CLIENT_URI}/maillist`
      })
      .then(data => {
        const hostname = process.env.EMAIL_HOSTNAME
        const port = process.env.EMAIL_PORT

        let smtpConfig = {
          host: hostname,
          port,
          secure: false
        }
        let transport = nodemailer.createTransport(smtpConfig)

        const mailOptions = {
          from: `Club Bieres <${process.env.EMAIL_SENDER}>`,
          to: drinkers.map(drinker => drinker.email).join(', '),
          subject: 'prochaine dégustation',
          html: data.html,
          attachments: [{
            filename: 'logo.png',
            path: path.resolve('./public/logo.png'),
            cid: 'logo'
          }]
        }
        return transport.sendMail(mailOptions)
      })
    })
}

module.exports = { newEvent }
