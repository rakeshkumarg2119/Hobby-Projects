package com.financesensei.api.dto;

import java.math.BigDecimal;

public record SummaryData(
        BigDecimal usdInr,
        BigDecimal eurInr,
        BigDecimal gbpInr,
        BigDecimal goldInrPer10g,
        BigDecimal silverInrPer10g) {
}
