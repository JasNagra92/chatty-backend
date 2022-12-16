import { BadRequestError } from './../../../shared/globals/helpers/error-handler';
import { IPostDocument } from './../interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemas/post.schemes';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from './../../../shared/services/redis/post.cache';
import { socketIOPostObject } from '@socket/post';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';

const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId,
      imgVersion,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });

    res.status(HTTP_STATUS.OK).json({ message: 'post updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePostWithImage(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if (result.public_id) {
        throw new BadRequestError(result.message);
      }
    }

    res.status(HTTP_STATUS.OK).json({ message: 'post updated successfully' });
  }

  private async updatePostWithImage(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId,
      imgVersion,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
    const { postId } = req.params;

    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      profilePicture,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
    // call image queue to add image to mongoDb

    return result;
  }
}
