package com.financesensei.api.service;

import com.financesensei.api.dto.MetalsPricesData;
import com.financesensei.api.dto.SummaryData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final ExchangeRateService exchangeRateService;
    private final MetalsService metalsService;

    /**
     * Builds a snapshot of key FX pairs and precious metal INR values.
     */
    public SummaryData getSummary() {
        MetalsPricesData metals = metalsService.getMetalsPrices();

        return new SummaryData(
                exchangeRateService.getExchangeRate("USD", "INR"),
                exchangeRateService.getExchangeRate("EUR", "INR"),
                exchangeRateService.getExchangeRate("GBP", "INR"),
                metals.gold().priceInrPer10g(),
                metals.silver().priceInrPer10g());
    }
}
