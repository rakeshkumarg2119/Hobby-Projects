package com.financesensei.api.dto;

import java.math.BigDecimal;

public record MetalsPricesData(
        BigDecimal usdToInrRate,
        MetalsPriceEntry gold,
        MetalsPriceEntry silver) {
}
