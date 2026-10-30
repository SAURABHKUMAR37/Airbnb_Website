import express from 'express';
import { authUser } from '../middleware/auth.js';
import { listFavourites, addFavourite, removeFavourite } from '../controllers/favouriteController.js';

const favouriteRouter = express.Router();
favouriteRouter.use(authUser);
favouriteRouter.get('/', listFavourites);
favouriteRouter.post('/:homeId', addFavourite);
favouriteRouter.delete('/:homeId', removeFavourite);
export default favouriteRouter;
