import { Request } from 'express';

export function extractRequestData(request: Request) {
  return {
    headers: {
      'user-agent': request.headers['user-agent'],
      'x-forwarded-for': request.headers['x-forwarded-for'],
      'x-real-ip': request.headers['x-real-ip'],
      'cf-connecting-ip': request.headers['cf-connecting-ip'],
    },
    ip: request.socket.remoteAddress,
  };
}
