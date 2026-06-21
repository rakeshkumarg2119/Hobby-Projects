package com.financesensei.api.controller;

import com.financesensei.api.dto.ApiResponse;
import com.financesensei.api.dto.HealthData;
import com.financesensei.api.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ApiResponse<HealthData> getHealth() {
        HealthData data = healthService.getHealthData();
        return ApiResponse.success(data, "finance-sensei-api");
    }
}
