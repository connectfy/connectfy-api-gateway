import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { BaseException } from '../common/constants/custom.exception';

@Injectable()
export class SafeQueryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body;

    if (!body || !body.query) return true;

    try {
      body.query = this.parseSafeQuery(body.query);
    } catch (e) {
      throw new BadRequestException('Invalid query format: ' + e.message);
    }

    return true;
  }

  private parseSafeQuery(queryItems: any[]): Record<string, any> {
    if (!Array.isArray(queryItems)) {
      throw new BaseException(
        'Query must be an array of conditions ',
        HttpStatus.BAD_REQUEST,
      );
    }

    const groups: Record<string, any[]> = {};
    const noSubOperator: any[] = []; //
    const mongoQuery: Record<string, any> = {};
    for (const item of queryItems) {
      const { field, operator, value, subOperator } = item;

      if (!field || !operator) {
        throw new BaseException(
          'Query must be an array of conditions ',
          HttpStatus.BAD_REQUEST,
        );
      }
      const condition = this.buildCondition(field, operator, value);
      if (subOperator) {
        const key = subOperator.toLowerCase();
        if (!groups[key]) groups[key] = [];
        groups[key].push(condition);
      } else {
        noSubOperator.push(condition);
      }
    }

    if (groups.and?.length) mongoQuery.$and = groups.and;
    if (groups.or?.length) mongoQuery.$or = groups.or;
    if (groups.nor?.length) mongoQuery.$nor = groups.nor;

    for (const cond of noSubOperator) {
      Object.assign(mongoQuery, cond);
    }

    // console.log('mongoQuery',mongoQuery);
    return mongoQuery;
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildCondition(field: string, operator: string, value: any) {
    switch (operator) {
      case 'eq':
        return { [field]: { $eq: value } };
      case 'ne':
        return { [field]: { $ne: value } };
      case 'gt':
        return { [field]: { $gt: value } };
      case 'gte':
        return { [field]: { $gte: value } };
      case 'lt':
        return { [field]: { $lt: value } };
      case 'lte':
        return { [field]: { $lte: value } };
      case 'in':
        if (!Array.isArray(value))
          throw new BaseException(
            'in value must be an array',
            HttpStatus.BAD_REQUEST,
          );
        return { [field]: { $in: value } };

      case 'notIn':
        if (!Array.isArray(value))
          throw new BaseException(
            'notIn value must be an array',
            HttpStatus.BAD_REQUEST,
          );
        return { [field]: { $nin: value } };

      case 'between':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new BaseException(
            'between must be an array with 2 values',
            HttpStatus.BAD_REQUEST,
          );
        }
        return { [field]: { $gte: value[0], $lte: value[1] } };

      case 'betweenExclusive':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new BaseException(
            'betweenExclusive must be an array with 2 values',
            HttpStatus.BAD_REQUEST,
          );
        }
        return { [field]: { $gt: value[0], $lt: value[1] } };

      case 'betweenLeftInclusive':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new BaseException(
            'betweenLeftInclusive must be an array with 2 values',
            HttpStatus.BAD_REQUEST,
          );
        }
        return { [field]: { $gte: value[0], $lt: value[1] } };

      case 'betweenRightInclusive':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new BaseException(
            'betweenRightInclusive must be an array with 2 values',
            HttpStatus.BAD_REQUEST,
          );
        }
        return { [field]: { $gt: value[0], $lte: value[1] } };

      case 'contains':
        return { [field]: { $regex: this.escapeRegex(value), $options: 'i' } };

      case 'notContains':
        return {
          [field]: { $not: { $regex: this.escapeRegex(value), $options: 'i' } },
        };

      case 'startsWith':
        return {
          [field]: { $regex: `^${this.escapeRegex(value)}`, $options: 'i' },
        };

      case 'endsWith':
        return {
          [field]: { $regex: `${this.escapeRegex(value)}$`, $options: 'i' },
        };

      case 'startsNotWith':
        return {
          [field]: {
            $not: { $regex: `^${this.escapeRegex(value)}`, $options: 'i' },
          },
        };

      case 'endsNotWith':
        return {
          [field]: {
            $not: { $regex: `${this.escapeRegex(value)}$`, $options: 'i' },
          },
        };

      case 'exists':
        return { [field]: { $exists: Boolean(value) } };

      case 'isNull':
        return { [field]: { $eq: null } };

      case 'notNull':
        return { [field]: { $ne: null } };

      case 'regex':
        try {
          return { [field]: { $regex: this.escapeRegex(value) } };
        } catch {
          throw new BaseException(
            'Invalid regex pattern',
            HttpStatus.BAD_REQUEST,
          );
        }
      default:
        throw new BaseException(
          `Unsupported operator: ${operator}`,
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}

/**
 * 
 * 
 * 
 * 
 *     "query": [
            {
                "field": "createdBy",
                "operator": "between",
                "value": [
                    3,
                    6
                ]
            },
            {
                "field": "_id",
                "operator": "eq",
                "value": "2256113e-dba7-4a43-8cc3-752013a4e3a2"
            },
            {
                "field": "workplaceId",
                "operator": "eq",
                "value": "392536c0-ca8d-42c1-99e1-a22585961fca"
            }
        ],

    
        | Operator                       | MongoDB Output                   | Description                      |
        | ------------------------------ | -------------------------------- | -------------------------------- |
        | `eq`                           | `{ $eq: value }`                 | Equals                           |
        | `ne`                           | `{ $ne: value }`                 | Not equals                       |
        | `gt`, `gte`, `lt`, `lte`       | `{ $gt: v }`, etc.               | Greater / Less comparisons       |
        | `in`, `notIn`                  | `{ $in: [] }`, `{ $nin: [] }`    | Value in/not in array            |
        | `between`                      | `{ $gte: v1, $lte: v2 }`         | Inclusive range                  |
        | `betweenExclusive`             | `{ $gt: v1, $lt: v2 }`           | Exclusive range                  |
        | `betweenLeftInclusive`         | `{ $gte: v1, $lt: v2 }`          | Left inclusive, right exclusive  |
        | `betweenRightInclusive`        | `{ $gt: v1, $lte: v2 }`          | Left exclusive, right inclusive  |
        | `contains`                     | `{ $regex: /value/i }`           | Case-insensitive substring match |
        | `notContains`                  | `{ $not: /value/i }`             | Not contains                     |
        | `startsWith`, `endsWith`       | Anchored regex                   | Begins/ends with                 |
        | `startsNotWith`, `endsNotWith` | Negated anchored regex           | Not begins/ends with             |
        | `exists`                       | `{ $exists: true/false }`        | Field existence check            |
        | `isNull`, `notNull`            | `{ $eq: null }`, `{ $ne: null }` | Check for null / not null        |
        | `regex`                        | `{ $regex: new RegExp(value) }`  | Raw regex (use carefully!)       |
 * 
 * 
 * 
 * 
 * 
 * 
 */
