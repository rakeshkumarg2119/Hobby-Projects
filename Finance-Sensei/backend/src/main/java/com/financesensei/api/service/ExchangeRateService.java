package com.financesensei.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financesensei.api.config.CacheConfig;
import com.financesensei.api.dto.CurrencyCodeDto;
import com.financesensei.api.dto.CurrencyConversionData;
import com.financesensei.api.dto.CurrencyListData;
import com.financesensei.api.dto.FxRateSnapshot;
import com.financesensei.api.exception.ExternalApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${exchangerate.api.key}")
    private String exchangeRateApiKey;

    @Value("${exchangerate.api.base-url:https://v6.exchangerate-api.com/v6}")
    private String exchangeRateBaseUrl;

    /**
     * Converts an amount from one currency to another using a cached live rate.
     */
    public CurrencyConversionData convertCurrency(String from, String to, BigDecimal amount) {
        validateCurrencyInput(from, to, amount);

        FxRateSnapshot snapshot = getExchangeRateSnapshot(from, to);
        BigDecimal convertedAmount = amount.multiply(snapshot.rate()).setScale(4, RoundingMode.HALF_UP);

        return new CurrencyConversionData(
                from.toUpperCase(),
                to.toUpperCase(),
                amount,
                convertedAmount,
                snapshot.rate(),
                snapshot.fetchedAt());
    }

    /**
     * Fetches and caches a live rate snapshot for a currency pair.
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_FX_PAIR, key = "#from.toUpperCase() + ':' + #to.toUpperCase()")
    public FxRateSnapshot getExchangeRateSnapshot(String from, String to) {
        validateCurrencyInput(from, to, BigDecimal.ONE);

        JsonNode root = callExchangeRateApi("/pair/%s/%s".formatted(from.toUpperCase(), to.toUpperCase()));

        JsonNode conversionRateNode = root.get("conversion_rate");
        if (conversionRateNode == null || conversionRateNode.isNull()) {
            throw new ExternalApiException("ExchangeRate-API did not return conversion_rate");
        }

        BigDecimal rate = conversionRateNode.decimalValue();
        OffsetDateTime fetchedAt = extractTimestamp(root);
        return new FxRateSnapshot(rate, fetchedAt);
    }

    /**
     * Returns all supported currencies from ExchangeRate-API.
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_CURRENCY_CODES)
    public CurrencyListData getSupportedCurrencies() {
        JsonNode root = callExchangeRateApi("/codes");
        JsonNode supportedCodesNode = root.get("supported_codes");
        if (supportedCodesNode == null || !supportedCodesNode.isArray()) {
            throw new ExternalApiException("ExchangeRate-API did not return supported currency codes");
        }

        List<CurrencyCodeDto> currencies = new ArrayList<>();
        for (JsonNode codeEntry : supportedCodesNode) {
            if (codeEntry.isArray() && codeEntry.size() >= 2) {
                currencies.add(new CurrencyCodeDto(codeEntry.get(0).asText(), codeEntry.get(1).asText()));
            }
        }
        return new CurrencyListData(currencies);
    }

    /**
     * Returns only the numeric exchange rate for a currency pair.
     */
    public BigDecimal getExchangeRate(String from, String to) {
        return getExchangeRateSnapshot(from, to).rate();
    }

    /**
     * Calls ExchangeRate-API and parses the JSON payload.
     */
    private JsonNode callExchangeRateApi(String path) {
        if (exchangeRateApiKey == null || exchangeRateApiKey.isBlank()) {
            throw new ExternalApiException("ExchangeRate API key is missing. Set exchangerate.api.key in application.properties");
        }

        String url = exchangeRateBaseUrl + "/" + exchangeRateApiKey + path;

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ExternalApiException("ExchangeRate-API returned an unexpected response status");
            }
            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.has("result") && !"success".equalsIgnoreCase(root.get("result").asText())) {
                String errorType = root.path("error-type").asText("unknown_error");
                throw new ExternalApiException("ExchangeRate-API failed: " + errorType);
            }
            return root;
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to call ExchangeRate-API", ex);
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to parse ExchangeRate-API response", ex);
        }
    }

    /**
     * Extracts API timestamp from the rate payload when available.
     */
    private OffsetDateTime extractTimestamp(JsonNode root) {
        if (root.has("time_last_update_unix")) {
            long seconds = root.get("time_last_update_unix").asLong();
            return OffsetDateTime.ofInstant(Instant.ofEpochSecond(seconds), ZoneOffset.UTC);
        }
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    /**
     * Validates currency and amount input.
     */
    private void validateCurrencyInput(String from, String to, BigDecimal amount) {
        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            throw new IllegalArgumentException("Both from and to currencies are required");
        }
        if (from.length() != 3 || to.length() != 3) {
            throw new IllegalArgumentException("Currency codes must be 3-letter ISO codes");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
    }
}
