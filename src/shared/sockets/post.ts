import { ICommentDocument } from './../../features/comments/interfaces/comment.interface';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server, Socket } from 'socket.io';

export let socketIOPostObject: Server;

export class SocketIOPostsHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('comment', (data: ICommentDocument) => {
        this.io.emit('update comment', data);
      });
    });
  }
}
