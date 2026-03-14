import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { EXPIRE_DATES, REDIS_KEYS } from 'connectfy-shared';

type SetOpts = { key: string; data: any; ttl?: number };

@Injectable()
export class CacheService {
  // process-local map to dedupe concurrent loads for same key
  private readonly inflightRequests = new Map<string, Promise<any>>();

  constructor(
    @Inject(REDIS_KEYS.REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async set(keyOrOpts: string | SetOpts, data?: any, ttl?: number) {
    let key: string;
    let value: any;
    let _ttl: number | undefined;

    if (typeof keyOrOpts === 'string') {
      key = keyOrOpts;
      value = data;
      _ttl = ttl;
    } else {
      key = keyOrOpts.key;
      value = keyOrOpts.data;
      _ttl = keyOrOpts.ttl;
    }

    const payload = JSON.stringify(value);

    if (_ttl && _ttl > 0) {
      await this.redis.set(key, payload, 'EX', _ttl);
    } else {
      await this.redis.set(
        key,
        payload,
        'EX',
        EXPIRE_DATES.TTL.ONE_MINUTE * 15,
      );
    }
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    const data = await this.redis.get(key);
    if (!data) return undefined;

    try {
      // IF data is JSON string, parse it
      return JSON.parse(data) as T;
    } catch {
      // IF data is not JSON string, return it as is
      return data as unknown as T;
    }
  }

  async remove(key: string) {
    await this.redis.del(key);
  }

  async removeMany(keys: string[]) {
    if (!keys || keys.length === 0) return 0;

    return await this.redis.del(...keys);
  }

  // getOrSet: if key exists return it, otherwise run loader(), set result and return it.
  // uses inflightRequests to dedupe concurrent loads.
  async getOrSet<T = any>(
    key: string,
    loader: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T | undefined> {
    // try fast GET first
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    // if another request is already loading this key, await it
    if (this.inflightRequests.has(key)) {
      return await this.inflightRequests.get(key);
    }

    // create loader promise and store in map
    const p = (async () => {
      try {
        const result = await loader();
        if (result !== undefined && result !== null) {
          await this.set({ key, data: result, ttl: ttlSeconds });
        }
        return result;
      } finally {
        // ensure map cleanup
        this.inflightRequests.delete(key);
      }
    })();

    this.inflightRequests.set(key, p);
    return p;
  }

  // production-friendly clearByPrefix (uses scanStream)
  async clearByPrefix(prefix: string) {
    const stream = this.redis.scanStream({ match: `${prefix}*`, count: 500 });
    const pipeline = this.redis.pipeline();
    let any = false;

    return new Promise<void>((resolve, reject) => {
      stream.on('data', (keys: string[]) => {
        if (keys.length) {
          any = true;
          keys.forEach((k) => pipeline.del(k));
        }
      });

      stream.on('end', async () => {
        if (any) {
          try {
            await pipeline.exec();
            resolve();
          } catch (err) {
            reject(err);
          }
        } else {
          resolve();
        }
      });

      stream.on('error', (err) => reject(err));
    });
  }

  async updatePreserveTtl(key: string, data: any) {
    const ttl = await this.redis.ttl(key);

    if (ttl > 0) {
      await this.set({ key, data, ttl });
    } else {
      await this.set({ key, data });
    }
  }
}
