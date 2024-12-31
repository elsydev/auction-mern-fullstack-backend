import mongoose from "mongoose";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.model.js";
import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";
import ErrorHandler from "../middlewares/error.js";



export const placeBid = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return next(new ErrorHandler("Formato de Identificación no válido",400))

  }
    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
      return next(new ErrorHandler("Item a subastar no encontrado", 404));
    }
    console.log("Auction item posting BID",auctionItem)
    const { amount } = req.body;
    console.log("amount",amount)
    if (!amount) {
      return next(new ErrorHandler("El monto de la oferta es requerido.", 404));
    }
    if (amount <= auctionItem.currentBid) {
      return next(
        new ErrorHandler("El monto de la oferta debe ser mayor al monto actual de la subasta.", 404)
      );
    }
    if (amount < auctionItem.startingBid) {
      return next(
        new ErrorHandler("El monto de la oferta debe ser mayor al monto de inicio de la subasta.", 404)
      );
    }
  
    try {
      const existingBid = await Bid.findOne({
        "bidder.id": req.user._id,
        auctionItem: auctionItem._id,
      });
      const existingBidInAuction = auctionItem.bids.find(
        (bid) => bid.userId.toString() == req.user._id.toString()
      );
      if (existingBid && existingBidInAuction) {
        existingBidInAuction.amount = amount;
        existingBid.amount = amount;
        await existingBidInAuction.save();
        await existingBid.save();
        auctionItem.currentBid = amount;
      } else {
        const bidderDetail = await User.findById(req.user._id);
        const bid = await Bid.create({
          amount,
          bidder: {
            id: bidderDetail._id,
            userName: bidderDetail.userName,
            profileImage: bidderDetail.profileImage?.url,
          },
          auctionItem: auctionItem._id,
        });
        auctionItem.bids.push({
          userId: req.user._id,
          userName: bidderDetail.userName,
          profileImage: bidderDetail.profileImage?.url,
          amount,
        });
        auctionItem.currentBid = amount;
      }
      await auctionItem.save();
  
      res.status(201).json({
        success: true,
        message: "La oferta ha sido registrada Exitosamente.",
        currentBid: auctionItem.currentBid,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || "Fallo al colocar la oferta", 500));
    }
  });


