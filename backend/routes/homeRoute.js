import express from 'express';
import { listHomes, getHome, getBookedDates } from '../controllers/homeController.js';

const homeRouter = express.Router();
homeRouter.get('/', listHomes);
homeRouter.get('/:id', getHome);
homeRouter.get('/:id/booked-dates', getBookedDates);
export default homeRouter;
