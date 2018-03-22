const Email = require('email-templates')

const newEvent = () => {
  const email = new Email({
    message: {
      from: process.env.EMAIL_SENDER
    },
    // uncomment below to send emails in development/test env:
    // send: true,
    transport: {
      jsonTransport: true
    }
  })

  const emailData = {
    template: 'newEvent',
    message: {
      to: 'antoineprudhomme5@gmail.com'
    },
    locals: {
      name: 'Antoine'
    }
  }

  return email.send(emailData)
}

module.exports = { newEvent }
