import { transporter } from "../config/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();
export const AuthEmail = async ({ email, token }) => {
  const info = await transporter.sendMail({
    from: "Multivendor <admin@multivendor.com>",
    to: email,
    subject: "Confirma tu cuenta en Multivendor",
    text: "Multivendor - Confirma tu cuenta",
    html: `<p>Ingresa este codigo al dar click en el enlace: <b>${token}</b></p>
        <a href=`${process.env.FRONTEND_URL}/confirm-account`>Confirmar Cuenta</a>
        `,
  });
  console.log("Mensaje Enviado", info.messageId);
};

export const passwordEmail = async ({ email, token }) => {
  const info = await transporter.sendMail({
    from: "Multivendor <admin@multivendor.com>",
    to: email,
    subject: "Reestablecer Password",
    text: "Multivendor - Reestablece tu pssword",
    html: `<p>Ingresa este codigo al dar click en el enlace: <b>${token}</b></p>
         <a href="${process.env.FRONTEND_URL}/validate-token" >Reestablecer Contraseña Haz click Aquí</a>
         `,
  });
  console.log("Mensaje Enviado", info.messageId);
};

export const sendEmail = async ({ email, subject,message }) => {
  console.log('Entrando a sendEmail con:', email, subject,message)
  const info = await transporter.sendMail({
    from: "Multivendor <admin@multivendor.com>",
    to: email,
    subject: subject,
    text: message
    
  });
  console.log("Mensaje Enviado", info.messageId);
};
