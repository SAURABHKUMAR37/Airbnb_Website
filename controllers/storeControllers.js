const Favourite = require("../models/favourite");
const Home = require("../models/home");
const Booking = require("../models/booking");
const Review = require("../models/review");
const { checkout } = require("../storerouter");

exports.getIndex = (req, res, next) => {
    Home.fetchAll(regesteredhome => {
        res.render("store/index", {
            regesteredhome: regesteredhome,
            pageTitle: "Airbnb Home",
            currentpage: "index"
        });
    });
};

exports.getHomes = (req, res, next) => {
    const filters = {
        location: req.query.location || "",
        minPrice: req.query.minPrice || "",
        maxPrice: req.query.maxPrice || "",
        sort: req.query.sort || ""
    };
    const hasFilters = filters.location || filters.minPrice || filters.maxPrice || filters.sort;
    if (hasFilters) {
        Home.search(filters, homes => {
            res.render("store/home-list", { regesteredhome: homes, pageTitle: "Homes List", currentpage: "Home", filters });
        });
    } else {
        Home.fetchAll(homes => {
            res.render("store/home-list", { regesteredhome: homes, pageTitle: "Homes List", currentpage: "Home", filters });
        });
    }
};

exports.getBookings = (req, res, next) => {
    Booking.fetchAll(bookings => {
        res.render("store/bookings", { bookings, pageTitle: "My Bookings", currentpage: "bookings" });
    });
};

exports.getFavouriteList = (req, res, next) => {
    Favourite.getFavourites(favourites => {
        Home.fetchAll(regesteredhome => {
            const favouriteHomes = regesteredhome.filter(home =>
                favourites.some(fav => fav.homeId === home._id.toString()));
            res.render("store/favourite-list", { favouriteHomes, pageTitle: "My favourites", currentpage: "favourite" });
        });
    });
};

exports.postAddtoFavourite = (req, res, next) => {
    try {
        Favourite.addToFavourite(req.body.id, (err) => {
            if (err) console.error("error while making favourite", err);
            return res.redirect("/favourite");
        });
    } catch (e) {
        console.error("Exception in postAddtoFavourite:", e);
        res.status(500).send("Server error");
    }
};

exports.posRemoveFromFavourite = (req, res, next) => {
    const homeId = req.params.homeId;
    Favourite.deleteById(homeId, error => {
        if (error) console.log("error while removing from favourite", error);
        res.redirect("/favourite");
    });
};

exports.getHomeDetails = (req, res, next) => {
    const homeID = req.params.homeID;
    const userId = req.session.user ? req.session.user._id.toString() : null;

    Home.findById(homeID, home => {
        if (!home) return res.redirect("/homes");

        Review.getByHomeId(homeID, reviews => {
            Review.getAverageRating(homeID, ratingInfo => {
                if (!userId) {
                    return res.render("store/home-detail", {
                        home, reviews, ratingInfo,
                        alreadyReviewed: false,
                        pageTitle: "Home Detail",
                        currentpage: "Home"
                    });
                }
                Review.checkExisting(homeID, userId, existingReview => {
                    res.render("store/home-detail", {
                        home, reviews, ratingInfo,
                        alreadyReviewed: !!existingReview,
                        pageTitle: "Home Detail",
                        currentpage: "Home"
                    });
                });
            });
        });
    });
};

exports.getReserve = (req, res, next) => {
    const homeID = req.params.homeId;
    Home.findById(homeID, home => {
        if (!home) return res.redirect("/homes");
        Booking.fetchByHomeId(homeID,bookings=>{
            const bookedDates=bookings.map(b=>({
                checkIn:b.checkIn,
                checkOut:b.checkOut
            }));
            res.render("store/reserve", { 
                home,
                bookedDates: JSON.stringify(bookedDates),
                 pageTitle: "Reserve Home",
                  currentpage: "bookings"
                 });

        });

    });
};

exports.postReserve = async (req, res, next) => {
    const { homeId, houseName, location, price, photoUrl, checkIn, checkOut } = req.body;
    const userId = req.session.user._id.toString();   
    const userName = req.session.user.name;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
        return res.render("store/reserve", { pageTitle: "Reserve Home", currentpage: "bookings", errorMessage: "Check-in date cannot be in the past.", home: { _id: homeId, houseName, location, price, photoUrl } });
    }
    if (checkInDate >= checkOutDate) {
        return res.render("store/reserve", { pageTitle: "Reserve Home", currentpage: "bookings", errorMessage: "Check-out date must be after check-in date.", home: { _id: homeId, houseName, location, price, photoUrl } });
    }
    const totalNights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (totalNights < 1) {
        return res.render("store/reserve", { pageTitle: "Reserve Home", currentpage: "bookings", errorMessage: "Minimum booking is 1 night.", home: { _id: homeId, houseName, location, price, photoUrl } });
    }
    Booking.fetchByHomeId(homeId,async(bookings)=>{
        const conflict=bookings.some(b=>{
            const exisIn=new Date(b.checkIn);
            const existOut=new Date(b.checkOut);
            return checkInDate<existOut && checkOutDate>exisIn;
        });
        if(conflict)
        {
            return res.render("store/reserve",{
                pageTitle:"Reserve Home",
                currentpage:"Bookings",
                errorMessage:"unabilabe for this date",
                home:{_id:homeId,houseName,location,price,photoUrl},
                bookedDates:'[]',
            });
        }
    
    
    const totalPrice = totalNights * parseInt(price);
    const booking = new Booking(homeId, houseName, location, price, photoUrl, checkIn, checkOut, totalNights, totalPrice,userId,userName);
    await booking.save();
    res.redirect("/bookings");
});
};

exports.postCancelBooking = (req, res, next) => {
    const bookingId = req.params.bookingId;
    Booking.deleteById(bookingId, err => {
        if (err) console.log("Error canceling booking:", err);
        res.redirect("/bookings");
    });
};

exports.postReview = (req, res, next) => {
    const homeId = req.params.homeID;
    const { rating, comment } = req.body;
    const user = req.session.user;

    Review.checkExisting(homeId, user._id.toString(), existingReview => {
        if (existingReview) {
            return res.redirect("/homes/" + homeId + "?error=already_reviewed");
        }
        const review = new Review(homeId, user._id.toString(), user.name, parseInt(rating), comment);
        review.save()
            .then(() => res.redirect("/homes/" + homeId))
            .catch(err => {
                console.log("Error saving review:", err);
                res.redirect("/homes/" + homeId);
            });
    });
};