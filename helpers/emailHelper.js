const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
const Drinker = mongoose.model('Drinker')

const newEvent = () => {
  return Drinker.find({ newsletters: { $ne: false } })
    .then(drinkers => {
      const socks = process.env.EMAIL_SOCKS
      const username = process.env.EMAIL_USERNAME
      const password = process.env.EMAIL_PASSWORD
      const hostname = process.env.EMAIL_HOSTNAME
      const port = process.env.EMAIL_PORT
      let transporter = nodemailer.createTransport(`${socks}://${username}:${password}@${hostname}`)

      const mailOptions = {
        from: '"C bieres 👥" <antoineprudhomme5@gmail.com>',
        to: 'antoineprudhomme5@gmail.com',
        subject: 'Prochaine dégustation',
        text: 'Hello world 🐴',
        html: '<b>Hello world 🐴</b>'
      }

      return transporter.sendMail(mailOptions)
    })
}

module.exports = { newEvent }
