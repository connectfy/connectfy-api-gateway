import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { EXPIRE_DATES } from '@common/constants/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AppCacheService {
  private readonly TTL = 15 * EXPIRE_DATES.TOKEN.ONE_MINUTE;

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  // =========================
  // SET DATA TO CACHE
  // =========================
  async set({
    key,
    data,
    ttl,
  }: {
    key: string;
    data: any;
    ttl?: number;
  }): Promise<void> {
    const expireTTL = ttl ?? this.TTL;
    await this.cache.set(key, data, expireTTL);
  }

  // =========================
  // GET DATA FROM CACHE
  // =========================
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cache.get<T>(key);
  }

  // =========================
  // REMOVE DATA FROM CACHE
  // =========================
  async remove(key: string): Promise<void> {
    await this.cache.del(key);
  }
}
