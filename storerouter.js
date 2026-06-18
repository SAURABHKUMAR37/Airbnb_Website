const express = require('express');
const storerouter = express.Router();
const path = require('path');
const isAuth = require("./middleware/auth");

const storeController = require("./controllers/storeControllers");

// Public routes
storerouter.get("/", storeController.getIndex);
storerouter.get("/homes", storeController.getHomes);

// ✅ Both home detail and review use same param :homeID
storerouter.get("/homes/:homeID", storeController.getHomeDetails);
storerouter.post("/homes/:homeID/review", isAuth, storeController.postReview);

// Protected routes
storerouter.get("/bookings", isAuth, storeController.getBookings);
storerouter.post("/bookings/delete/:bookingId", isAuth, storeController.postCancelBooking);

storerouter.get("/favourite", isAuth, storeController.getFavouriteList);
storerouter.post("/favourite", isAuth, storeController.postAddtoFavourite);
storerouter.post("/favourite/delete/:homeId", isAuth, storeController.posRemoveFromFavourite);

storerouter.get("/reserve/:homeId", isAuth, storeController.getReserve);
storerouter.post("/reserve", isAuth, storeController.postReserve);

module.exports = storerouter;