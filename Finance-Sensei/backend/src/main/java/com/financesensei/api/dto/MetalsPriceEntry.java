package com.financesensei.api.dto;

import java.math.BigDecimal;

public record MetalsPriceEntry(
        String symbol,
        BigDecimal priceUsdPerGram,
        BigDecimal priceInrPerGram,
        BigDecimal priceUsdPer10g,
        BigDecimal priceInrPer10g) {
}
