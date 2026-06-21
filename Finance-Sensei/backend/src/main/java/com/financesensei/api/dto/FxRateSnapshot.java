package com.financesensei.api.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record FxRateSnapshot(BigDecimal rate, OffsetDateTime fetchedAt) {
}
