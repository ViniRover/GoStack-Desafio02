import { Router } from 'express';
import multer from 'multer';

import RecipientController from './app/controllers/RecipientController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import authMidlleware from './app/middlewares/auth';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidlleware);
routes.post('/recipient', RecipientController.store);
routes.put('/recipient', RecipientController.update);

routes.put('/users', UserController.update);

routes.post('/deliverymans', DeliverymanController.store);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
