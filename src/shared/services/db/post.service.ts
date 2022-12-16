import { UserModel } from '@root/features/user/models/user.schema';
import { IPostDocument, IGetPostsQuery, IQueryComplete, IQueryDeleted } from './../../../features/post/interfaces/post.interface';
import { config } from '@root/config';
import Logger from 'bunyan';
import { PostModel } from '@post/models/post.schema';
import { Query, UpdateQuery } from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';

const log: Logger = config.createLogger('postService');

export class PostService {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
    // can also do 2 seperate await calls instead of Promise All, then Promise and UpdateQuery types not needed
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postsQuery = {};
    if (query.imgId && query.gifUrl) {
      postsQuery = { $or: [{ imgId: { $ne: ' ' } }, { gifUrl: { $ne: ' ' } }] };
    } else {
      postsQuery = query;
    }

    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postsQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);

    return posts;
  }

  public async postsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });

    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletePost, decrementPostCount]);
  }
  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    await Promise.all([updatePost]);
  }
}

export const postService: PostService = new PostService();
