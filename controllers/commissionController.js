import PaymentProof from "../models/commissionProof.js";
import User from "../models/user.model.js"
import Auction from "../models/Auction.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import mongoose from "mongoose";
import { uploadImage } from "../libs/cloudinary.js";


export const calculateCommission = async (auctionId) => {
    const auction = await Auction.findById(auctionId);
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return next(new ErrorHandler("Identificador de subasta inválido.", 400));
    }
    const commissionRate = 0.05;
    const commission = auction.currentBid * commissionRate;
    return commission;
  };

export const proofOfCommission= catchAsyncErrors(async(req,res,next)=>{
    /* console.log("Recibiendo el req en proofOfCommission",req.user) */
    console.log("Entrando a proofOfCommission")
    console.log("req.user._id",req.user._id)
    let image;
    console.log(req.files)
    if (!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("La captura de pantalla del pago es requerida",400))
        
    };
    const {proof}=req.files;
    const {amount,comment}=req.body;
    const user=await User.findById(req.user._id);
    if(!user) return next(new ErrorHandler("Usuario no existe",404))
    if(user.role!== "Auctioneer") return next(new ErrorHandler("Usuario no autorizado a enviar prueba de comision",501))
if(!amount || !comment){
    return next(new ErrorHandler("La cantidad a pagar y los comentarios son campos requeridos",400))
}
    if(user.unpaidCommission ===0){
        return res.status(200).json({
            success:true,
            message:"No tiene comisiones por pagar",
        })
    }
    if(user.unpaidCommission < amount){
        return next(new ErrorHandler(`La cantidad introducida excede el monto de su comision no pagada, por favor introduzca una cantidad que no exceda ${user.unpaidCommission}`,403));
    }
   
    const allowedFormats=["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(proof.mimetype)){
        return next(new ErrorHandler("Formato de archivo de la captura de pantalla no es soportado",400));
    }
    const cloudinaryResponse = await uploadImage(proof.tempFilePath);
    image = {
      url: cloudinaryResponse.secure_url,
      public_id: cloudinaryResponse.public_id,
    };
    const commissionProof = PaymentProof.create({
        userId:req.user.id,
        proof:{
            url: image.url,
            public_id: image.public_id,
        },
        amount,
        comment
    });

    
    res.status(200).json({
        success:true,
        message:"Su prueba de pago ha sido enviada exitosamente, será revisado y luego le avisaremos en un periodo no mayor a 24 Horas",
        commissionProof
    })

})