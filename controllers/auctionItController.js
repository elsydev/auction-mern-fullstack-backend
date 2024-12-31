import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.model.js";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js"
import ErrorHandler from "../middlewares/error.js";
//import {v2 as cloudinary} from 'cloudinary';
import { uploadImage } from "../libs/cloudinary.js";
import mongoose from "mongoose";

export const addNewAuctionItem=catchAsyncErrors(async(req,res,next)=>{
  let image;
    if (!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("La imagen del articulo a subastar es requerida",400))
        
    }
    const {auctionImage}=req.files;
    const allowedFormats=["image/png","image/jpeg","image/webp"];

    if(!allowedFormats.includes(auctionImage.mimetype)){
        return next(new ErrorHandler("Formato de archivo no soportado",400));
    }

    const {
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime}=req.body;
if(
    !title ||
        !description ||
        !category ||
        !condition ||
        !startingBid ||
        !startTime ||
        !endTime
){
    return next (new ErrorHandler("Por favor llene todos los detalles",400));
}
if (new Date(startTime) < Date.now()){
    return next(new ErrorHandler("La fecha de inicio de la subasta no puede ser anterior a la actual",400))

}
if (new Date(startTime) >= new Date(endTime)){
    return next(new ErrorHandler("La fecha fin de la subasta debe ser mayor a fecha de inicio de la subasta",400))

}
const alreadyOneAuctionActive= await Auction.find({
    createdBy:req.user._id,
    endTime:{$gt:new Date()},
});
if(alreadyOneAuctionActive.length > 0){
  console.log("datos de subasta activa",alreadyOneAuctionActive)
    return next(new ErrorHandler("Ya existe una subasta activa o tiene una comision no pagada",400))
}
try {
    /* const cloudinaryResponse= await cloudinary.uploader.upload(
        image.tempFilePath,
        {
            folder:"AUCTION_MEDIA_FOLDER_AUCTIONS",
        });
      if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("Cloudinary error:",cloudinaryResponse.error || "Unknown cloudinary error")
      return next (new ErrorHandler("Falló al subir la imagen a Cloudinary",500))
    }   */
    const cloudinaryResponse = await uploadImage(auctionImage.tempFilePath);
    image = {
      url: cloudinaryResponse.secure_url,
      public_id: cloudinaryResponse.public_id,
    };
    const auctionItem=await Auction.create({
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime,
        auctionImage: {
          url: image.url,
          public_id: image.public_id,
        },
        createdBy:req.user._id,
        //Agregar aqui middleware para activitylog del usuario
    });
    res.status(201).json({
        success:true, 
        message:`El item a subastar ha sido creado y listado para ser subastado en la página a las ${startTime}`,
        auctionItem})
} catch (error) {
    console.log(error);
    return next (new ErrorHandler(error.message ||"Error al crear subasta",500))

}

});
export const getAllItems= catchAsyncErrors(async(req,res,next)=>{
    let items= await Auction.find();
    if(!items || items.length===0){
       return next(new ErrorHandler("No existen Items en la subasta",404))
        }

    

    res.status(200).json(items)
});
export const getAuctionDetails= catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
     if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",400))

    } 
    const existingAuctionItem= await Auction.findById(id); 
    if(!existingAuctionItem){
        return next(new ErrorHandler("Subasta no encontrada",400))
    }
    const bidders=existingAuctionItem.bids.sort((a,b)=>b.bid - a.bid);

    res.status(200).json({
        success:true,
        existingAuctionItem,
        bidders,
    })
});
export const getMyAuctionItems= catchAsyncErrors(async(req,res,next)=>{
 const items= await Auction.find({createdBy:req.user._id});
 if(!items){
  return next(new ErrorHandler("No tiene items para subastar aun",400))
}
    res.status(200).json({
        success:true,
        items,
    })
});

export const removeFromAuction= catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",400))

    } 
    const existingAuctionItem= await Auction.findById(id); 
    if(!existingAuctionItem){
        return next(new ErrorHandler("Subasta no encontrada",400))
    }

    await existingAuctionItem.deleteOne();
    res.status(200).json({
        success:true,
        message:"Articulo eliminado de la subasta exitosamente",
    })
});



export const republishItem = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    console.log("Desde el controlador de auctions, republish auction, id",id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid Id format.", 400));
    }
    let auctionItem = await Auction.findById(id);
    if (!auctionItem) {
      return next(new ErrorHandler("Auction not found.", 404));
    }
    if (!req.body.startTime || !req.body.endTime) {
      return next(
        new ErrorHandler("Starttime and Endtime for republish is mandatory.")
      );
    }
    if (new Date(auctionItem.endTime) > Date.now()) {
      return next(
        new ErrorHandler("Auction is already active, can not republish", 400)
      );
    }
    let data = {
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
    };
    if (data.startTime < Date.now()) {
      return next(
        new ErrorHandler(
          "Auction starting time must be greater than present time",
          400
        )
      );
    }
    if (data.startTime >= data.endTime) {
      return next(
        new ErrorHandler(
          "Auction starting time must be less than ending time.",
          400
        )
      );
    }
/*     if (!auctionItem.highestBidder ) {
      return next(
        new ErrorHandler(
          "Auction has no Bids.",
          400
        )
      );
    } */
    if (auctionItem.highestBidder) {
      const highestBidder = await User.findById(auctionItem.highestBidder);
      highestBidder.moneySpent -= auctionItem.currentBid;
      highestBidder.auctionsWon -= 1;
      highestBidder.save();
    }
  
    data.bids = [];
    data.commissionCalculated = false;
    data.currentBid = 0;
    data.highestBidder = null;
    auctionItem = await Auction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    await Bid.deleteMany({ auctionItem: auctionItem._id });
    const createdBy = await User.findByIdAndUpdate(
      req.user._id,
      { unpaidCommission: 0 },
      {
        new: true,
        runValidators: false,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      success: true,
      auctionItem,
      message: `Auction republished and will be active on ${req.body.startTime}`,
      createdBy,
    });
  });


/* export const republishItem= catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",400))

    }
    let existingAuctionItem= await Auction.findById(id); 
    if(!existingAuctionItem){
        return next(new ErrorHandler("Subasta no encontrada",400))
    }
    if(!req.body.startTime || !req.body.endTime){
        return next(new ErrorHandler("Las fechas de inicio y fin de la subasta son obligatorias para re-publicar",400))
    }
    if(new Date(existingAuctionItem.endTime) > Date.now()){
        return next(new ErrorHandler("La subasta aún está activa, no se puede republicar",400))
    }
    let data={
        startTime:new Date(req.body.startTime),
        endTime:new Date(req.body.endTime),
    };
    if(data.startTime < Date.now()){
        return next(new ErrorHandler("La fecha de inciio de la subasta debe ser mayor a la fecha actual",400))

    }
    if(data.startTime >= data.endTime  ){
        return next(new ErrorHandler("La fecha de inciio de la subasta debe ser mayor a la fecha de finalización",400))

    }

    if(existingAuctionItem.highestBidder){
        const highestBidder=await User.findById(auctionItem.highestBidder);
        highestBidder.moneySpent -= existingAuctionItem.currentBid;
        highestBidder.auctionsWon -= 1;
        highestBidder.save();
    }
    data.bids=[];
    data.comissionCalculated=false;
    data.currentBid=0;
    data.highestBidder=null;
    let auctionItem= await Auction.findByIdAndUpdate(id,data,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    await Bid.deleteMany({auctionItem:auctionItem._id})
   
    const createdBy=await User.findByIdAndUpdate(req.user._id,{unpaidCommission:0},{
        new:true,
        runValidators:false,
        useFindAndModify:false,
    })
    res.status(200).json({
        success:true,
        message:`Subasta re-publicada exitosamente y estara activa a aprtir del ${req.body.startTime}`,
        createdBy
    })
}); */