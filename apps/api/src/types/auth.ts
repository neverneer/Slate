export interface JwtPayload {
  userId: string;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}
