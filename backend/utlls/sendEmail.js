import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

const sendEmail = async (subject, send_to, sent_from, reply_to, template, name, link) => {
    // Create Email Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const handlebarOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve("./views"),
            defaultLayout: false
        },
        viewPath: path.resolve("./views"),
        extName: ".handlebars",
    }

    transporter.use("compile", hbs(handlebarOptions));

    // Options fro sending email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        template: template,
        subject: subject,
        context: {
            name: name,
            link: link
        }
    }

    // Send Email
    transporter.sendMail(options, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    })
}

export default sendEmail;