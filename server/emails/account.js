const sgmail = require('@sendgrid/mail')

sgmail.setApiKey(process.env.SENDGRID_API_KEY)    //sets up the API key for our account


const sendWelcomeEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: 'parthivmenon.dev@gmail.com',
        subject: 'Welcome to Notes',
        text: 'Welcome to the app, ' + name +'. Let me know how you get along!'
    }).then(() => {
        console.log('Email sent!')
    }).catch((e) => {
        console.log('Email not sent!')
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: 'parthivmenon.dev@gmail.com',
        subject: 'Goodbye!',
        text: 'Hello, ' + name +'. Thank you for being a part of Notes! Goodbye!'
    }).then(() => {
        console.log('Email sent!')
    }).catch((e) => {
        console.log('Email not sent!')
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}


