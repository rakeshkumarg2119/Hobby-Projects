package com.financesensei.api.dto;

import java.util.List;

public record HealthData(String status, long cacheTtlMinutes, List<CacheInfoData> caches) {
}
