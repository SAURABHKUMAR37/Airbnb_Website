const Favourite = require("../models/favourite");
const Home=require("../models/home");
const Booking = require("../models/booking"); 

exports.getAddHome = (req, res, next) => {
    res.render('host/edit-home', {
        pageTitle: 'Add home to airbnb',
        currentpage: 'addhome',
        editing:false,
    });
};
exports.getEditHome = (req, res, next) => {
    const homeId=req.params.homeId;
    const editing=req.query.editing==="true";
    Home.findById(homeId,home=>{
        if(!home)
        {
            console.log("home not found for editing");
           return res.redirect("/host-home-list");
        }
         console.log(homeId,editing,home);
        res.render('host/edit-home', {
            home:home,
        pageTitle: 'Edit your home',
        currentpage: 'host-homes',
        editing:editing
    });

    });
   
};

exports.getHostHomes = (req, res, next) => {
    const userId = req.session.user._id.toString();
    Home.fetchByUserId(userId, homes => {
        
        // Har home ke liye bookings fetch karo
        const promises = homes.map(home => {
            return new Promise((resolve) => {
                Booking.fetchByHomeId(home._id.toString(), bookings => {
                    home.bookings = bookings;          // bookings home ke saath attach
                    home.bookingCount = bookings.length; // count bhi save
                    resolve(home);
                });
            });
        });

        Promise.all(promises).then(homesWithBookings => {
            res.render("host/host-home-list", {
                regesteredhome: homesWithBookings,
                pageTitle: "Host-Homes List",
                currentpage: "host-homes"
            });
        });
    });
};
 


 
exports.postAddHome = async (req, res, next) => {
    const {houseName, price, location, rating, photoUrl} = req.body;
    const userId = req.session.user._id.toString();
    let photos=req.body.photos||[];
    if(typeof photos==='string') photos=[photos];
    photos=photos.filter(p=>p.trim()!=='');
    const home = new Home(houseName, price, location, rating, photoUrl, null, userId,photos); 
    await home.save();
    res.redirect('/host-home-list');
};
exports.postEditHome = async (req, res, next) => {
    const {id, houseName, price, location, rating, photoUrl} = req.body;

    let photos = req.body.photos || [];
    if (typeof photos === 'string') photos = [photos];
    photos = photos.filter(p => p.trim() !== '');
    const userId = req.session.user._id.toString(); // ✅ add this

    const home = new Home(houseName, price, location, rating, photoUrl, id,userId,photos); 
    await home.save();
    res.redirect('/host-home-list');
};
exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;

    Home.deleteById(homeId, () => {

        Favourite.deleteById(homeId, (err) => {
            if (err) {
                console.log("Error removing from favourites:", err);
            }

            console.log("Home and favourite deleted");
            res.redirect("/host-home-list");
        });

    });
};

