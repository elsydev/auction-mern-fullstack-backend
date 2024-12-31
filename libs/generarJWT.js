import jwt from "jsonwebtoken";

const generarJWT = (id) => {
  return jwt.sign({ id }, process.env.SECRET_JWT_WORD, {
    expiresIn: "30d",
  });
};
export default generarJWT;
