import dotenv from "dotenv";
import app from "./app.js";
import conectarDB from "./config/db.js"




dotenv.config()
const port =process.env.PORT || 4000
app.listen(port, () => console.log(`Server started on port ${port}`));
 // Conectar a la base de datos al iniciar el servidor