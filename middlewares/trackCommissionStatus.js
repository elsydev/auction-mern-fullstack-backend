import User from "../models/user.model.js";
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "./error.js";

export const trackCommissionStatus=catchAsyncErrors(async(req,res,next)=>{
    const user =await User.findById(req.user._id)

    if(user.unpaidCommission >0){
        return next(new  ErrorHandler("Tiene una comisión por pagar, por favor pagar antes de publicar una nueva subasta",403))

    }
    next()
;});