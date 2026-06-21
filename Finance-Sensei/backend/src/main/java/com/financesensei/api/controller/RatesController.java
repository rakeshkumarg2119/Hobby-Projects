package com.financesensei.api.controller;

import com.financesensei.api.dto.ApiResponse;
import com.financesensei.api.dto.CurrencyConversionData;
import com.financesensei.api.dto.CurrencyListData;
import com.financesensei.api.dto.MetalsPricesData;
import com.financesensei.api.dto.SummaryData;
import com.financesensei.api.service.ExchangeRateService;
import com.financesensei.api.service.MetalsService;
import com.financesensei.api.service.SummaryService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rates")
@RequiredArgsConstructor
public class RatesController {

    private final ExchangeRateService exchangeRateService;
    private final MetalsService metalsService;
    private final SummaryService summaryService;

    @GetMapping("/currency")
    public ApiResponse<CurrencyConversionData> convertCurrency(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount) {
        CurrencyConversionData data = exchangeRateService.convertCurrency(from, to, amount);
        return ApiResponse.success(data, "ExchangeRate-API");
    }

    @GetMapping("/currency/list")
    public ApiResponse<CurrencyListData> getCurrencyList() {
        CurrencyListData data = exchangeRateService.getSupportedCurrencies();
        return ApiResponse.success(data, "ExchangeRate-API");
    }

    @GetMapping("/metals")
    public ApiResponse<MetalsPricesData> getMetalsPrices() {
        MetalsPricesData data = metalsService.getMetalsPrices();
        return ApiResponse.success(data, "GoldAPI.io + ExchangeRate-API");
    }

    @GetMapping("/summary")
    public ApiResponse<SummaryData> getSummary() {
        SummaryData data = summaryService.getSummary();
        return ApiResponse.success(data, "Finance-Sensei Summary");
    }
}
