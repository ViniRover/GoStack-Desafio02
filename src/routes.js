import { Router } from 'express';
import multer from 'multer';

import RecipientController from './app/controllers/RecipientController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliveriesController from './app/controllers/DeliveriesController';
import ProblemController from './app/controllers/ProblemController';

import authMidlleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveriesController.index);
routes.put(
  '/deliveryman/:id/deliveries/:order_id',
  DeliveriesController.update
);

routes.post('/problems', ProblemController.store);

routes.use(authMidlleware);
routes.post('/recipient', RecipientController.store);
routes.put('/recipient', RecipientController.update);

routes.put('/users', UserController.update);

routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.get('/deliverymans', DeliverymanController.index);
routes.delete('/deliverymans/:id', DeliverymanController.delete);

routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.get('/orders', OrderController.index);
routes.delete('/orders/:id', OrderController.delete);

routes.get('/problems', ProblemController.index);
routes.get('/problems/:delivery_id', ProblemController.index);
routes.delete('/problems/:id/cancel-delivery', ProblemController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
