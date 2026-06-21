package com.financesensei.api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_FX_PAIR = "fx-pair";
    public static final String CACHE_CURRENCY_CODES = "currency-codes";
    public static final String CACHE_METAL_OUNCE_USD = "metal-ounce-usd";
    public static final String CACHE_DAILY_QUOTE = "daily-quote";

    @Bean
    public CacheManager cacheManager(@Value("${cache.ttl.minutes:15}") long ttlMinutes) {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheNames(List.of(CACHE_FX_PAIR, CACHE_CURRENCY_CODES, CACHE_METAL_OUNCE_USD, CACHE_DAILY_QUOTE));
        cacheManager.setAllowNullValues(false);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
            .recordStats()
                .maximumSize(500));
        return cacheManager;
    }
}
