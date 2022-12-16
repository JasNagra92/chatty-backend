import { ICommentNameList } from './../interfaces/comment.interface';
import { commentService } from './../../../shared/services/db/comment.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument } from '@comment/interfaces/comment.interface';
import { CommentCache } from '@service/redis/comments.cache';
import mongoose from 'mongoose';

const commentCache: CommentCache = new CommentCache();

export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'post comments', comments });
  }

  public async commentsNamesFromCache(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedCommentNames: ICommentNameList[] = await commentCache.getCommentsNamesFromCache(postId);
    const commentsNames: ICommentNameList[] = cachedCommentNames.length
      ? cachedCommentNames
      : await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'post comments names', comments: commentsNames });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments[0] });
  }
}
