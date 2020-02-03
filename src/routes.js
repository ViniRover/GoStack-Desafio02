import { Router } from 'express';

import RecipientController from './app/controllers/RecipientController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMidlleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidlleware);
routes.post('/recipient', RecipientController.store);
routes.put('/recipient', RecipientController.update);
routes.put('/users', UserController.update);

export default routes;
