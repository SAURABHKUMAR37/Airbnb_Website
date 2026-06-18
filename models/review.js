const {ObjectId} = require("mongodb");
const {getDb} = require("../utill/databaseutill");
 
module.exports = class Review{
    constructor(homeId, userId, userName, rating, comment) {
        this.homeId = homeId;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = new Date();
}
 save(){
    const db = getDb();
    return db.collection("reviews").insertOne(this);
 }

 static getByHomeId(homeId,callback){
    const db =getDb();
    db.collection("reviews")
    .find({homeId :homeId})
    .sort({createdAt :-1})
    .toArray()
    .then(reviews => callback(reviews))
    .catch(err => console.log(err));
 }
 static getAverageRating(homeId,callback){
    const db = getDb();
    db.collection("reviews")
    .aggregate([
        {$match :{homeId :homeId}},
        {$group:{
            _id : "$homeId",
            avgRating:{$avg: "$rating"},
            totalReviews: {$sum:1}
        }}
    ])
    .toArray()
    .then(result=>{
        if(result.length>0){
            callback({
                avgRating: result[0].avgRating.toFixed(1),
                totalReviews: result[0].totalReviews
            });
        }else{
            callback({avgRating: 0 ,totalReviews:0  });
        }
    })
    .catch(err=>console.log(err));
 }
   static checkExisting(homeId,userId,callback){
    const db =getDb();
    db.collection("reviews")
    .findOne({homeId:homeId,userId:userId})
    .then(review => callback(review))
    .catch(err => console.log(err));
   }
};