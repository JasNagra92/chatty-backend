import { emailWorker } from './../../workers/email.worker';
import { IEmailJob } from './../../../features/user/interfaces/user.interface';
import { BaseQueue } from './base.queue';

export class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob('forgotPassword', 5, emailWorker.addNotificationEmail);
  }
  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
