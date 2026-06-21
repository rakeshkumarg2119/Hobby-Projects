package com.financesensei.api.service;

import com.financesensei.api.dto.CacheInfoData;
import com.financesensei.api.dto.HealthData;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HealthService {

    private final CacheManager cacheManager;

    @Value("${cache.ttl.minutes:15}")
    private long cacheTtlMinutes;

    /**
     * Returns application health metadata and cache details.
     */
    public HealthData getHealthData() {
        List<CacheInfoData> caches = cacheManager.getCacheNames().stream()
                .map(this::toCacheInfo)
                .toList();

        return new HealthData("UP", cacheTtlMinutes, caches);
    }

    /**
     * Resolves cache size when supported by the underlying provider.
     */
    private CacheInfoData toCacheInfo(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return new CacheInfoData(cacheName, -1);
        }

        Object nativeCache = cache.getNativeCache();
        if (nativeCache instanceof com.github.benmanes.caffeine.cache.Cache<?, ?> caffeineCache) {
            return new CacheInfoData(cacheName, caffeineCache.estimatedSize());
        }

        return new CacheInfoData(cacheName, -1);
    }
}
