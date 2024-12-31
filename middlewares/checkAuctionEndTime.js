import Auction from "../models/Auction.js";
import mongoose from "mongoose";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";

export const checkAuctionEndTime = catchAsyncErrors(async (req, res, next) => {
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",404))

    }
    
    const auction = await Auction.findById(id);

    if(!auction){
        return next(new ErrorHandler("Subasta no encontrada",400))
    }
    
    const now=new Date();
    if(new Date(auction.startTime) > now){
        return next(new ErrorHandler("La Subasta no ha iniciado aun",400))

    }
    if(new Date(auction.endTime) < now){
        return next(new ErrorHandler("La Subasta ha concluido",400))

    }
    next();
});
