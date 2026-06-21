package com.financesensei.api.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CurrencyConversionData(
        String from,
        String to,
        BigDecimal amount,
        BigDecimal convertedAmount,
        BigDecimal exchangeRate,
        OffsetDateTime rateTimestamp) {
}
