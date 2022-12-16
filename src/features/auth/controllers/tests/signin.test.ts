import { mergedAuthAndUserData } from './../../../../mocks/user.mock';
import { authService } from '@service/db/auth.service';
import { SignIn } from '../signin';
import { Request, Response } from 'express';
import { authMock, authMockRequest, authMockResponse } from './../../../../mocks/auth.mock';
import { CustomError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { userService } from '@service/db/user.service';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';
const WRONG_USERNAME = 'ma';
const WRONG_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1';
const LONG_USERNAME = 'mathematics';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

describe('SignIn', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should throw an error if username not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is too short', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is too long', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password is shorter than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password is longer than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid Credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid Credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);

    await SignIn.prototype.read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successful',
      user: mergedAuthAndUserData,
      token: req.session?.jwt
    });
  });
});
