import cron from "node-cron";
import  Auction  from "../models/Auction.js";
import  User  from "../models/user.model.js";
import  Bid  from "../models/Bid.js";
import { sendEmail } from "../emails/AuthEmails.js";
import { sendEmails } from "../emails/sendEmails.js";
import { calculateCommission } from "../controllers/commissionController.js";

export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();
    console.log("Esto es now",now)
    console.log("Cron for ended auction running...");
    const endedAuctions = await Auction.find({
      endTime: { $lt: now },
      commissionCalculated: false,
    });
   console.log("Subasta terminada",endedAuctions)
    /******Testing */  
   /* if(!endedAuctions.length >0){
        console.log("No Consegui una Subasta terminada")
    } else{
      endedAuctions.forEach( (auction) => {
        console.log("La fecha de fin en endedAuction",auction.endTime)
    })
  
    } */

    /******Fin Testing */

    
     for (const auction of endedAuctions) {
      try {
        console.log(auction.endTime)
        const commissionAmount = await calculateCommission(auction._id);
        auction.commissionCalculated = true;
        const highestBidder = await Bid.findOne({
          auctionItem: auction._id,
          amount: auction.currentBid,
        });
       
          console.log("Consegui el bidder mas alto y es: ", highestBidder);
      
        const auctioneer = await User.findById(auction.createdBy);
        auctioneer.unpaidCommission = commissionAmount;
       
          console.log("Consegui el auctioneer y la comision es: ", auctioneer.unpaidCommission);
     
        if (highestBidder) {
          auction.highestBidder = highestBidder.bidder.id;
          console.log("Registro del highestbidder en la auction:  ",auction.highestBidder)
          await auction.save();
          const bidder = await User.findById(highestBidder.bidder.id);
          console.log("El bidder es:",bidder)
          await User.findByIdAndUpdate(
            bidder._id,
            {
              $inc: {
                moneySpent: highestBidder.amount,
                auctionsWon: 1,
              },
            },
            { new: true }
          );
          await User.findByIdAndUpdate(
            auctioneer._id,
            {
              $inc: {
                unpaidCommission: commissionAmount,
              },
            },
            { new: true }
          );
          const subject = `Congratulations! You won the auction for ${auction.title}`;
          const message = `Dear ${bidder.userName}, Pagame`;
          console.log("SENDING EMAIL TO HIGHEST BIDDER");
          sendEmail({ email: bidder.email, subject, message }); 
          sendEmails({ email: bidder.email, subject, message });
          console.log("SUCCESSFULLY EMAIL SENT TO HIGHEST BIDDER");
        } else {
          await auction.save();
        }
      } catch (error) {
        return next(console.error(error || "Some error in ended auction cron"));
      }
    }
  });
};