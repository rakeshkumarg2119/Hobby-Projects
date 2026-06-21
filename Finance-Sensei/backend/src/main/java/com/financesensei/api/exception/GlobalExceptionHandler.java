package com.financesensei.api.exception;

import com.financesensei.api.dto.ApiResponse;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleBadRequest(IllegalArgumentException ex) {
        ApiResponse<Map<String, String>> response = ApiResponse.failure(
                Map.of("error", ex.getMessage()),
                "finance-sensei-api");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ExternalApiException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleExternalApi(ExternalApiException ex) {
        ApiResponse<Map<String, String>> response = ApiResponse.failure(
                Map.of("error", ex.getMessage()),
                "finance-sensei-api");
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleGeneric(Exception ex) {
        ApiResponse<Map<String, String>> response = ApiResponse.failure(
                Map.of("error", "Unexpected server error"),
                "finance-sensei-api");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
