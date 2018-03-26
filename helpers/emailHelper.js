const path = require('path')
const nodemailer = require('nodemailer')
const Email = require('email-templates')
const mongoose = require('mongoose')
const Drinker = mongoose.model('Drinker')

const templatesDir = path.resolve(__dirname, '..', 'emails')

const newEvent = (event) => {
  return Drinker.find({ newsletters: { $ne: false } })
    .then(drinkers => {

      const email = new Email()

      // transform timestamp to human readable date
      const date = new Date(event.when)
      event.humanDate = `${date.getUTCDate()} / ${date.getMonth()}`

      email
      .renderAll('event', { event, clientURI: process.env.CLIENT_URI })
      .then(data => {
        const socks = process.env.EMAIL_SOCKS
        const username = process.env.EMAIL_USERNAME
        const password = process.env.EMAIL_PASSWORD
        const hostname = process.env.EMAIL_HOSTNAME
        const port = process.env.EMAIL_PORT
        let transport = nodemailer.createTransport(`${socks}://${username}:${password}@${hostname}`)

        const mailOptions = {
          from: '"C bieres 👥" <antoineprudhomme5@gmail.com>',
          to: 'antoineprudhomme5@gmail.com',
          subject: 'Prochaine dégustation',
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
