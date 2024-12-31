import jwt from "jsonwebtoken";

const secretWord = process.env.SECRET_WORD;
console.log(secretWord);
export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.SECRET_JWT_WORD,

      {
        expiresIn: "7d",
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}
