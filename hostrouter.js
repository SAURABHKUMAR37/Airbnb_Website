const express = require("express");
const hostrouter = express.Router();
const path=require('path');
const isAuth=require("./middleware/auth");

const hostController = require("./controllers/hostControllers");

hostrouter.get("/host/add-home", isAuth, hostController.getAddHome);
hostrouter.post("/host/add-home", isAuth, hostController.postAddHome);
hostrouter.get("/host-home-list", isAuth, hostController.getHostHomes);
hostrouter.get("/host/edit-home/:homeId", isAuth, hostController.getEditHome);
hostrouter.post("/host/edit-home", isAuth, hostController.postEditHome);
hostrouter.post("/host/delete-home/:homeId", isAuth, hostController.postDeleteHome);


module.exports = hostrouter;
