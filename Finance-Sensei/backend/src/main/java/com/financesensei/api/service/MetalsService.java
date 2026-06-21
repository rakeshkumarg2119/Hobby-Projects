package com.financesensei.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financesensei.api.config.CacheConfig;
import com.financesensei.api.dto.MetalsPriceEntry;
import com.financesensei.api.dto.MetalsPricesData;
import com.financesensei.api.exception.ExternalApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class MetalsService {

    private static final BigDecimal TROY_OUNCE_IN_GRAMS = new BigDecimal("31.1034768");
    private static final BigDecimal TEN = new BigDecimal("10");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExchangeRateService exchangeRateService;

    @Value("${metals.api.key}")
    private String metalsApiKey;

    @Value("${metals.api.base-url:https://www.goldapi.io/api}")
    private String metalsBaseUrl;

    /**
     * Returns live gold and silver prices in USD and INR (per gram and per 10 grams).
     */
    public MetalsPricesData getMetalsPrices() {
        BigDecimal usdToInr = exchangeRateService.getExchangeRate("USD", "INR");
        BigDecimal goldUsdPerOunce = getMetalUsdPerOunce("XAU");
        BigDecimal silverUsdPerOunce = getMetalUsdPerOunce("XAG");

        MetalsPriceEntry gold = toPriceEntry("GOLD", goldUsdPerOunce, usdToInr);
        MetalsPriceEntry silver = toPriceEntry("SILVER", silverUsdPerOunce, usdToInr);

        return new MetalsPricesData(usdToInr, gold, silver);
    }

    /**
     * Fetches and caches the latest metal price in USD per troy ounce.
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_METAL_OUNCE_USD, key = "#symbol")
    public BigDecimal getMetalUsdPerOunce(String symbol) {
        if (metalsApiKey == null || metalsApiKey.isBlank()) {
            throw new ExternalApiException("Metals API key is missing. Set metals.api.key in application.properties");
        }

        String url = metalsBaseUrl + "/" + symbol + "/USD";

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-access-token", metalsApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ExternalApiException("Metals API returned an unexpected response status");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode priceNode = root.get("price");
            if (priceNode == null || priceNode.isNull()) {
                throw new ExternalApiException("Metals API response does not include price field");
            }
            return priceNode.decimalValue();
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to call Metals API", ex);
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to parse Metals API response", ex);
        }
    }

    /**
     * Converts a USD per ounce metal value into response-friendly units.
     */
    private MetalsPriceEntry toPriceEntry(String symbol, BigDecimal usdPerOunce, BigDecimal usdToInr) {
        BigDecimal usdPerGram = usdPerOunce.divide(TROY_OUNCE_IN_GRAMS, 6, RoundingMode.HALF_UP);
        BigDecimal inrPerGram = usdPerGram.multiply(usdToInr).setScale(4, RoundingMode.HALF_UP);
        BigDecimal usdPer10g = usdPerGram.multiply(TEN).setScale(4, RoundingMode.HALF_UP);
        BigDecimal inrPer10g = inrPerGram.multiply(TEN).setScale(4, RoundingMode.HALF_UP);

        return new MetalsPriceEntry(
                symbol,
                usdPerGram.setScale(4, RoundingMode.HALF_UP),
                inrPerGram,
                usdPer10g,
                inrPer10g);
    }
}
