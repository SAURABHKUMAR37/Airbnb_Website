const { getDb } = require("../utill/databaseutill");
const { ObjectId } = require("mongodb");   // ✅ fixed capital O, removed wrong import

module.exports = class Booking {
    constructor(homeId, houseName, location, price, photoUrl, checkIn, checkOut, totalNights, totalPrice, userId, userName) {
    this.homeId = homeId;
    this.houseName = houseName;
    this.location = location;
    this.price = price;
    this.photoUrl = photoUrl;
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.totalNights = totalNights;
    this.totalPrice = totalPrice;
    this.userId = userId || null;      
    this.userName = userName || null;  
}
    save() {
        const db = getDb();
        return db.collection("bookings").insertOne(this);
    }
    static fetchAll(callback) {
        const db = getDb();
        db.collection("bookings")
            .find()
            .toArray()
            .then(bookings => callback(bookings))
            .catch(err => console.log(err));
    }
    static deleteById(bookingId, callback) {
        const db = getDb();
        db.collection("bookings")
            .deleteOne({ _id: new ObjectId(bookingId) })  // ✅ now works
            .then(() => callback(null))
            .catch(err => callback(err));
    }
    static fetchByHomeId(homeId, callback) {
    const db = getDb();
    db.collection("bookings")
        .find({ homeId: homeId })
        .toArray()
        .then(bookings => callback(bookings))
        .catch(err => console.log(err));
}
};