import mongoose from "mongoose";
import colors from 'colors'
import dotenv from "dotenv"

dotenv.config()

const conectarDB = async () => {
   // console.log(process.env.MONGO_URI);
    try {
        const connection= await mongoose.connect(process.env.MONGO_URI)

        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`MongoDB Conectado en: ${url}`))
    } catch (error) {
        // console.log(error.message)
        console.log( colors.red.bold('Error al conectar a MongoDB') )
        process.exit(1);
    }
  };
  export default conectarDB;