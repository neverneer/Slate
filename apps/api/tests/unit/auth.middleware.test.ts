import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken, generateToken, verifyToken } from '../../src/middleware/auth.middleware';
import { UserSessionModel } from '../../src/models/user-session.model';

vi.mock('../../src/models/user-session.model');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: '127.0.0.1',
      get: vi.fn(),
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        jti: 'jti-123',
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        jti: 'jti-123',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.jti).toBe(payload.jti);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token with active session', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        jti: 'jti-123',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        token_jti: 'jti-123',
        expires_at: new Date(Date.now() + 86400000),
      };

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(mockSession as any);
      vi.mocked(UserSessionModel.updateLastActive).mockResolvedValue();

      await authenticateToken(
        mockRequest as any,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect((mockRequest as any).user).toBeDefined();
      expect((mockRequest as any).user.userId).toBe('user-123');
    });

    it('should reject request without authorization header', async () => {
      await authenticateToken(
        mockRequest as any,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      await authenticateToken(
        mockRequest as any,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with expired session', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        jti: 'jti-123',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const expiredSession = {
        id: 'session-123',
        user_id: 'user-123',
        token_jti: 'jti-123',
        expires_at: new Date(Date.now() - 1000),
      };

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(expiredSession as any);

      await authenticateToken(
        mockRequest as any,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired session',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request when session not found', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        jti: 'jti-123',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(UserSessionModel.findByJti).mockResolvedValue(null);

      await authenticateToken(
        mockRequest as any,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired session',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
