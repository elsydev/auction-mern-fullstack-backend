import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ErrorHandler from "./error.js";

export const authRequired = async (req, res, next) => {
  const { token } = req.cookies;
console.log('Token desde authRequired:',token)
  if (!token) {
    return next(new ErrorHandler("Usuario no auntenticado",400))
  }

  const decoded = jwt.verify(token, process.env.SECRET_JWT_WORD);
  req.user = await User.findById(decoded.id);
console.log("En auth Required:",req.user)
  next();
};


export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Usuario no autenticado", 401));
    }
    console.log(req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`${req.user.role} No está autirizado para acceder`,403))
    }

    next();
  };
};
