import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token)
      const decoded = jwt.verify(token, process.env.SECRET_JWT_WORD);

      req.user = await User.findById(decoded.id).select(
        "-password -confirmed -token -createdAt -updatedAt -__v"
      );

      return next();
    } catch (error) {
      return res.status(404).json({ message:"Hubo un error en la autenticacion" });
    }
  }

  if (!token) {
    const error = new Error("Token no válido");
    return res.status(401).json({ message: error.message });
  }

  next();
};

export default checkAuth;
