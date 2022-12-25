import { Update } from './../controllers/update-post';
import { Get } from './../controllers/get-posts';
import { authMiddleware } from './../../../shared/globals/helpers/authMiddleware';
import express, { Router } from 'express';
import { CreatePost } from '@post/controllers/create-post';
import { Delete } from '@post/controllers/delete-post';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);

    this.router.post('/post', authMiddleware.checkAuthentication, CreatePost.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, CreatePost.prototype.postWithImage);

    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
