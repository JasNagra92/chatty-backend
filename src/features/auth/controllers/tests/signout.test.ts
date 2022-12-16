import { SignOut } from '../signout';
import { authMockRequest, authMockResponse } from './../../../../mocks/auth.mock';
import { Request, Response } from 'express';
const USERNAME = 'manny';
const PASSWORD = 'qwerty';

describe('SignOut', () => {
  it('should set session to null and send correct json message', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    await SignOut.prototype.update(req, res);
    expect(req.session).toBe(null);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'logout successful',
      user: {},
      token: ''
    });
  });
});
