import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmails=async({email,subject,message})=>{

    const transporter=nodeMailer.createTransport({
        host:process.env.SMTP_HOSTS,
        port:process.env.SMTP_PORTS,
        service: process.env.SMTP_SERVICES,
        auth:{
            user:process.env.SMTP_MAILS,
            pass:process.env.SMTP_PASSWORDS
        }
    });
    const options = {
        from: process.env.SMTP_MAILS,
        to: email,
        subject: subject,
        text: message,
      };
      await transporter.sendMail(options);

}