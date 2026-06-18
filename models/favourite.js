const { getDb } = require("../utill/databaseutill");
const { ObjectId } = require("mongodb");

module.exports = class Favourite {

  // Favourite add karna
  static addToFavourite(homeId, callback) {
    const db = getDb();

    // Pehle check karo — already favourite hai?
    db.collection("favourites")
      .findOne({ homeId: homeId })
      .then(existing => {
        if (existing) {
          return callback(null, "Already in favourites");
        }
        // Nahi hai toh insert karo
        return db.collection("favourites")
          .insertOne({ homeId: homeId });
      })
      .then(result => {
        if (result) callback(null, "Added to favourites");
      })
      .catch(err => callback(err));
  }

  // Saare favourites lao
  static getFavourites(callback) {
    const db = getDb();
    db.collection("favourites")
      .find()
      .toArray()
      .then(favourites => callback(favourites))
      .catch(err => callback([]));
  }

  // Delete karo
  static deleteById(delHomeId, callback) {
    const db = getDb();
    db.collection("favourites")
      .deleteOne({ homeId: delHomeId })
      .then(() => callback(null))
      .catch(err => callback(err));
  }
};