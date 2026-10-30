import express from 'express';
import { authUser } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { myHomes, getMyHome, addHome, editHome, deleteHome } from '../controllers/hostController.js';

const hostRouter = express.Router();
hostRouter.use(authUser);
hostRouter.get('/homes', myHomes);
hostRouter.post('/homes', uploadImages, addHome);
hostRouter.get('/homes/:id', getMyHome);
hostRouter.put('/homes/:id', uploadImages, editHome);
hostRouter.delete('/homes/:id', deleteHome);
export default hostRouter;
