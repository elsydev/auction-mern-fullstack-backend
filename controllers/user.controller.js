import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import { uploadImage } from "../libs/cloudinary.js";
import jwt from "jsonwebtoken";
import generarId from "../libs/generarId.js";
import { AuthEmail, passwordEmail } from "../emails/AuthEmails.js";
import generarJWT from '../libs/generarJWT.js'
import { sendEmails } from "../emails/sendEmails.js";
import dotenv from "dotenv";


dotenv.config()

export const register=catchAsyncErrors(async (req,res,next)=>{
let image;
    if (!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("La imagen del perfil del usuario es requerida",400))
        
    }
    console.log("Esto es req.files", req.files)
    const {profileImage}=req.files;
    const allowedFormats=["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(profileImage.mimetype)){
        return next(new ErrorHandler("Formato de archivo no soportado",400));
    }
    const {
        userName, 
        email,
        password,
        phone, 
        address,
        role,
        bankAccountNumber,
        bankAccountName,
        bankName,
        paypalEmail
    }=req.body;

    if(!userName || !email || !phone || !password || !address || !role){
        return next(new ErrorHandler("Por favor llene todos los campos",400));
    }
    if(role ==="Auctioneer"){
        if(!bankAccountName || !bankAccountNumber || !bankName){
            return next(new ErrorHandler("Por favor proveer toda la infomacion bancaria solicitada",400));
        }
        if(!paypalEmail){
            return next(new ErrorHandler("Por favor proveer su email registrado a paypal",400));
        }
        
    }
    const cloudinaryResponse = await uploadImage(profileImage.tempFilePath);
    image = {
      url: cloudinaryResponse.secure_url,
      public_id: cloudinaryResponse.public_id,
    };
    const existingUser= await User.findOne({email});
    if(existingUser){
        return next(new ErrorHandler("Ya existe un usuario con este correo electronico",400));
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser =  await new User({
        userName, 
        email,
        password:passwordHash,
        phone, 
        address,
        role,
        profileImage: {
            url: image.url,
            public_id: image.public_id,
          },
        paymentMethods:{
            bankTransfer:{
                bankAccountNumber,
                bankAccountName,
                bankName,
                
            }
        },
        paypal:{
            paypalEmail,
    
        },
        
    });
    const savedUser= await newUser.save();
    savedUser.token = generarId();
    savedUser.confirmed = false;
    await savedUser.save();
     AuthEmail({ email: savedUser.email, token: savedUser.token });
     const enlace=`<p>Ingresa el codigo al dar click en el enlace:</p>
     <a href="${process.env.FRONTEND_URL}confirm-account">Confirmar Cuenta</a>
     `
     const message = `Dear ${savedUser.userName}, Por favor haga click en el siguiente enlace ${enlace} e introduzca este codigo ${savedUser.token} para confirmar su cuenta:`;
    sendEmails({email:savedUser.email,subject:"Confirmar Cuenta",message});
     res.json({savedUser,message:"Registro Exitoso, revise su email para confirmar cuenta"}).status(201);
    console.log(savedUser);

});

export const login=catchAsyncErrors(async (req,res,next)=>{

    const { email, password } = req.body;
    
    if(!email || !password){
        return next(new ErrorHandler("Por favor todos los campos del formulario"))
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("No existe un usuario asociado a ese email",400));
    }
    if (!user.confirmed) {
        return next(new ErrorHandler("Usuario no ha sido confirmado, revise su email y siga las instruccines",500));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ErrorHandler("Contraseña inválida",400))
    }

    //Token con cookies
/*     const token = await createAccessToken({ id: user._id });
    console.log(token)
    res.cookie("token", token, {
      sameSite: "none",
      secure: true,
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      //maxAge: 1000 * 60 * 60 * 24,
      priority: "high",
      path: "/",
      
    }); */

    //Token con local storage
    const token=generarJWT(user._id)
    user.token=token
    await user.save()

    res
      .json(user).status(201);
});

export const confirmar=catchAsyncErrors(async (req,res,next)=>{
        const { token } = req.body;  
        try {
  
    console.log("En backend confirmando token:", token);

    const userToConfirm = await User.findOne({ token });
    if (!userToConfirm) {
        return next(new ErrorHandler("Token no válido",403));
    }
    userToConfirm.confirmed = true;
    userToConfirm.token = "";
    const user = await userToConfirm.save();
    return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
    
});

export const verifyToken =catchAsyncErrors(async (req,res,next)=>{
    const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }
  jwt.verify(token, process.env.SECRET_JWT_WORD, async (err, user) => {
    if (err) return res.status(401).json({ message: "No Autorizado" });
    const userFound = await User.findById(user.id);
    if (!userFound) {
      return res.status(401).json({ message: "No Autorizado" });
    }
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      profileImage: userFound.profileImage,
      role: userFound.role,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  });
});
export const perfil = async (req, res) => {
  const { user } = req;

  res.json(user);
};
export const validateToken =catchAsyncErrors(async (req,res,next)=>{
    const { token } = req.body;
  try {
    const userFound = await User.findOne({ token });

    if (!userFound) {
        return next(new ErrorHandler("Token no válido",403));
    }
    res.status(200).json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      token: userFound.token,
    });
  } catch (error) {
    console.log(error);
  }
});
export const requirePassword= catchAsyncErrors(async(req,res,next)=>{
    const { email } = req.body;
    const userFound = await User.findOne({ email });
  
    if (!userFound) {
      return next(new ErrorHandler("Usuario no encontrado",400));
    }
    if (!userFound.confirmed) {
      return next(new ErrorHandler("Usuario no confirmado, revise su email y siga las instrcciones",500));
    }
    try {
      userFound.token = generarId();
      await userFound.save();
      passwordEmail({ email: userFound.email, token: userFound.token });
      const enlace=`http://127.0.0.1:5173/validate-token`
      const message = `Dear ${userFound.userName}, Por favor haga click en el siguiente enlace ${enlace} e ingrese el siguiente codigo ${userFound.token} para confirmar su cuenta:`;
    sendEmails({email:userFound.email,subject:"Actualizar password",message});
      res
        .status(200)
        .json({
          message:
            "Solicitud de cambio de password recibida, instrucciones enviadas al correo",
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
});

export const updatePasswordWithToken= catchAsyncErrors(async(req,res,next)=>{
    const { token } = req.params;
    const { newPassword } = req.body;
    console.log("Esto viene en req.body", req.body);
    console.log("Desde UpdatePasswordWithTOken", newPassword);
    if (newPassword === null || newPassword === undefined)
    return next(new ErrorHandler("password inválido",400));
    if (token === null || token === undefined)
    return next(new ErrorHandler("token inválido",400));
    const user = await User.findOne({ token });
    if (!user) {
        return next(new ErrorHandler("usuario no encontrado, token no válido",400));
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    user.token = "";
    await user.save();
    res.json({ message: "Password Modificado Correctamente" });
});

export const logout= catchAsyncErrors(async(req,res,next)=>{
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout Successfully.",
    });
});

export const profile= catchAsyncErrors(async(req,res,next)=>{
  console.log(req.user);
  const userFound = await User.findById(req.user._id);
  if (!userFound) {
    return next(new ErrorHandler("usuario no encontrado, token no válido",400));
  }
  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    profileImage: userFound.profileImage,
    role: userFound.role,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
});

export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ moneySpent: { $gt: 0 } });
  const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);
  res.status(200).json(leaderboard);
});

export const pruebatecnica = catchAsyncErrors(async (req, res, next) => {
  const data = [
    { id: 1, nombre: "Mascotas", idPadre: 0 },
    { id: 2, nombre: "Gato", idPadre: 1 },
    { id: 3, nombre: "Perro", idPadre: 1 },
    { id: 4, nombre: "Plantas", idPadre: 0 },
    { id: 5, nombre: "Árbol", idPadre: 4 },
    { id: 6, nombre: "Flores", idPadre: 3 },
    { id: 7, nombre: "Micu", idPadre: 2 },
    { id: 8, nombre: "Sasy", idPadre: 2 },
    { id: 9, nombre: "Fido", idPadre: 3 },
    { id: 10, nombre: "Bobby", idPadre: 3 },
    { id: 11, nombre: "Roble", idPadre: 5 },
    { id: 12, nombre: "Mimi", idPadre: 2 }, // Nuevo gato
    { id: 13, nombre: "Rex", idPadre: 3 }   // Nuevo perro
];

function mostrarJerarquia(data, idPadre = 0, nivel = 0) {
    const hijos = data.filter(item => item.idPadre === idPadre);
    
    for (const hijo of hijos) {
        console.log(' '.repeat(nivel * 2) + hijo.nombre); // Indentación por nivel
        mostrarJerarquia(data, hijo.id, nivel + 1); // Llamada recursiva
    }
}

// Llamada a la función para mostrar la jerarquía
mostrarJerarquia(data);
});