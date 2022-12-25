import { commentRoutes } from './features/comments/routes/commentRoutes';
import { postRoutes } from './features/post/routes/postRoutes';
import { authMiddleware } from './shared/globals/helpers/authMiddleware';
import { currentUserRoutes } from './features/auth/routes/current-routes';
import { serverAdapter } from './shared/services/queues/base.queue';
import { authRoutes } from './features/auth/routes/authRoutes';
import { Application } from 'express';
import { healthRoutes } from '@user/routes/healthRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use('', healthRoutes.health());
    app.use('', healthRoutes.env());
    app.use('', healthRoutes.instance());
    app.use('', healthRoutes.fiboRoute());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
  };

  routes();
};
