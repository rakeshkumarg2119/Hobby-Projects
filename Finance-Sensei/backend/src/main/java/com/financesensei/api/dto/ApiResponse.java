package com.financesensei.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean success, T data, OffsetDateTime timestamp, String source) {

    public static <T> ApiResponse<T> success(T data, String source) {
        return new ApiResponse<>(true, data, OffsetDateTime.now(ZoneOffset.UTC), source);
    }

    public static <T> ApiResponse<T> failure(T data, String source) {
        return new ApiResponse<>(false, data, OffsetDateTime.now(ZoneOffset.UTC), source);
    }
}
