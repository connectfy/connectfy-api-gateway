export const ExceptionMessages = {
  INTERNAL_SERVER_ERROR_MESSAGE:
    'An unexpected error occurred. Please try again later.',
  BAD_REQUEST_MESSAGE:
    'The request could not be understood or was missing required parameters.',
  UNAUTHORIZED_MESSAGE:
    'Authentication failed or user does not have permissions for the requested operation.',
  FORBIDDEN_MESSAGE:
    'Authentication succeeded but authenticated user does not have access to the requested resource.',
  NOT_FOUND_MESSAGE: 'The requested resource could not be found.',
  CONFLICT_MESSAGE:
    'The request could not be completed due to a conflict with the current state of the resource.',
  UNPROCESSABLE_ENTITY_MESSAGE:
    'The request was well-formed but was unable to be followed due to semantic errors.',
  GONE_MESSAGE:
    'The requested resource is no longer available at the server and no forwarding address is known.',
  TOO_MANY_REQUESTS_MESSAGE:
    'The user has sent too many requests in a given amount of time ("rate limiting").',
};

export const ExceptionTypes = {
  INTERNAL_SERVER_ERROR: 'InternalServerError',
  BAD_REQUEST: 'BadRequest',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'NotFound',
  CONFLICT: 'Conflict',
  UNPROCESSABLE_ENTITY: 'UnprocessableEntity',
  GONE: 'Gone',
  TOO_MANY_REQUESTS: 'TooManyRequests',
};
