import { resetPasswordTemplate } from './../../../shared/services/emails/templates/reset-password/reset-password-template';
import { IResetPasswordParams } from './../../user/interfaces/user.interface';
import { emailQueue } from './../../../shared/services/queues/email.queue';
import { forgotPasswordTemplate } from './../../../shared/services/emails/templates/forgot-password/forgot-password-template';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from './../interfaces/auth.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import crypto from 'crypto';
import moment from 'moment';
import publicIp from 'ip';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    console.log(randomCharacters);

    await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
    emailQueue.addEmailJob('forgotPassword', { template, receiverEmail: email, subject: 'reset your password' });

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    console.log(token);

    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);

    if (!existingUser) {
      throw new BadRequestError('Reset token has expired');
    }

    existingUser.password = password;
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetExpires = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIp.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPassword', { template, receiverEmail: existingUser.email, subject: 'password reset Confirmation' });

    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated' });
  }
}
