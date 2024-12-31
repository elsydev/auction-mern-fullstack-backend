import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Auction from "../models/Auction.js"
import ErrorHandler from "../middlewares/error.js";
import Commission from "../models/Commission.js";
import PaymentProof from "../models/commissionProof.js"


export const deleteAuctionItem= catchAsyncErrors(async(req,res,next)=>{
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
    });
});

export const getAllPaymentProofs =catchAsyncErrors(async (req,res,next)=>{
    let paymentProofs =await PaymentProof.find();
    res.status(200).json({
        success:true,
        paymentProofs,
    });

});

export const getPaymentProofDetail = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    
    console.log("id de la prueba de pago desde el controller",id)
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",400))

    } 
    const paymentProofDetail =await PaymentProof.findById(id);
    if(!paymentProofDetail){
        return next(new ErrorHandler("Prueba de pago no encontrada",404))
    }
    res.status(200).json({
        success:true,
        paymentProofDetail,
    })
});

export const updateProofStatus =catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    console.log("id de la prueba de pago desde el controller",id)
    const {amount,status} =req.body;
    console.log("amount y status de la prueba de pago desde el controller",amount,status)
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",400))
    } ;
    if(!amount || !status){
        return next(new ErrorHandler("Los campos cantidad y status deben estar llenos",400))
    }
    let proof =await PaymentProof.findById(id);
    if (!proof){
        return next(new ErrorHandler("Prueba de pago no encontrada",404))
    };
    proof =await PaymentProof.findByIdAndUpdate(id,{
        amount,
        status,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,
        message:"Prueba de pago actualizada exitosamente",
        proof,
    })

});

export const deletePaymentProof =catchAsyncErrors(async (req,res,next)=>{
   const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Formato de Identificación no válido",400))

    };
    const proof =await PaymentProof.findById(id);
    if (!proof){
        return next(new ErrorHandler("Prueba de pago no encontrada",404))
    };
    await proof.deleteOne();
    res.status(200).json({
        success:true,
        message:"Prueba de pago eliminada exitosamente",
    });
});











export const fetchAllUsers =catchAsyncErrors(async(req,res,next)=>{

    const users=await User.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            month: "$_id.month",
            year: "$_id.year",
            role: "$_id.role",
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { year: 1, month: 1 },
        },
      ]);

const bidders= await users.filter((user)=>user.role ==="Bidder");
const auctioneers = users.filter((user) => user.role === "Auctioneer");

const tranformDataToMonthlyArray = (data, totalMonths = 12) => {
    const result = Array(totalMonths).fill(0);

    data.forEach((item) => {
      result[item.month - 1] = item.count;
    });

    return result;
  };
  const biddersArray = tranformDataToMonthlyArray(bidders);
  const auctioneersArray = tranformDataToMonthlyArray(auctioneers);

  res.status(200).json({
    success: true,
    biddersArray,
    auctioneersArray,
  });

});


export const monthlyRevenue = catchAsyncErrors(async (req, res, next) => {
    const payments = await Commission.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
  
    const tranformDataToMonthlyArray = (payments, totalMonths = 12) => {
      const result = Array(totalMonths).fill(0);
  
      payments.forEach((payment) => {
        result[payment._id.month - 1] = payment.totalAmount;
      });
  
      return result;
    };
  
    const totalMonthlyRevenue = tranformDataToMonthlyArray(payments);
    res.status(200).json({
      success: true,
      totalMonthlyRevenue,
    });
  });