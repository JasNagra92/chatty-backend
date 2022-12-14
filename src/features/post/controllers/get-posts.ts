import { postService } from './../../../shared/services/db/post.service';
import { Request, Response } from 'express';
import { PostCache } from './../../../shared/services/redis/post.cache';
import { IPostDocument } from './../interfaces/post.interface';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);

    const start: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];
    let totalPosts = 0;
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('posts', start, limit);

    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsInCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }

    res.status(HTTP_STATUS.OK).json({ message: 'all posts', posts, totalPosts });
  }
  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);

    const start: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', start, limit);

    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }
}
