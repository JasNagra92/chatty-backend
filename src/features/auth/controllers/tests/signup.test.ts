/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserCache } from './../../../../shared/services/redis/user.cache';
import { authService } from '@service/db/auth.service';
import { CustomError } from '@global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from './../../../../mocks/auth.mock';
import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { SignUp } from '../signup';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'da',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'daddfdfisldfnso',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'danny',
        email: 'not an email',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if password is too short', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'danny',
        email: 'test@email.com',
        password: 'qw',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw unauthroized error if user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'danny',
        email: 'test@email.com',
        password: 'qwwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials, user already exists');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'danny',
        email: 'test@email.com',
        password: 'qwwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64;SGVsfbdsbfbfIdbjfsbkfs=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '2345234' }));

    await SignUp.prototype.create(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
