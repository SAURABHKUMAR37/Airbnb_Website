const { ObjectId } = require("mongodb");
const { getDb } = require("../utill/databaseutill");
const dns = require("dns");
dns.setServers(['1.1.1.1', '8.8.8.8']);

module.exports = class Home {
    constructor(houseName, price, location, rating, photoUrl, id, userId,photos) {
        this.houseName = houseName;
        this.price = price;
        this.location = location;
        this.rating = rating;
        this.photoUrl = photoUrl;
        this.userId = userId || null;
        this.photos=photos||[];
        if (id) {
            this._id = new ObjectId(id);
        }
    }

    save() {
        const db = getDb();
        if (this._id) {
            return db.collection("homes").updateOne(
                { _id: this._id },
                {
                    $set: {
                        houseName: this.houseName,
                        price: this.price,
                        location: this.location,
                        rating: this.rating,
                        photoUrl: this.photoUrl,
                        userId: this.userId,  
                        photos:this.photos,
                    },
                }
            );
        }
        return db.collection("homes").insertOne(this);
    }

    static fetchAll(callback) {
        getDb()
            .collection("homes")
            .find()
            .toArray()
            .then(homes => callback(homes))
            .catch(err => console.log(err));
    }

    static findById(homeId, callback) {
        getDb()
            .collection("homes")
            .findOne({ _id: new ObjectId(homeId) })
            .then(home => callback(home))
            .catch(err => console.log(err));
    }

    static deleteById(homeId, callback) {
        getDb()
            .collection("homes")
            .deleteOne({ _id: new ObjectId(homeId) })
            .then(() => callback())
            .catch(err => console.log(err));
    }

    static search(filters, callback) {
        const db = getDb();
        let query = {};
        let sortOption = {};

        if (filters.location && filters.location.trim() !== "") {
            query.location = {
                $regex: filters.location,
                $options: "i"
            };
        }

        if (filters.minPrice && filters.minPrice !== "") {
            query.price = { ...query.price, $gte: parseInt(filters.minPrice) };
        }

        if (filters.maxPrice && filters.maxPrice !== "") {
            query.price = { ...query.price, $lte: parseInt(filters.maxPrice) };
        }

        if (filters.sort === "rating") {
            sortOption = { rating: -1 };
        } else if (filters.sort === "priceLow") {
            sortOption = { price: 1 };
        } else if (filters.sort === "priceHigh") {
            sortOption = { price: -1 };
        }

        db.collection("homes")
            .find(query)
            .sort(sortOption)
            .toArray()
            .then(homes => callback(homes))
            .catch(err => console.log(err));
    }

    static fetchByUserId(userId, callback) {
        getDb()
            .collection("homes")
            .find({ userId: userId })
            .toArray()
            .then(homes => callback(homes))
            .catch(err => console.log(err));
    }
};