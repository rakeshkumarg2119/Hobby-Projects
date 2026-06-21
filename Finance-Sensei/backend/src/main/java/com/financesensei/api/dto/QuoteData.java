package com.financesensei.api.dto;

import java.util.List;

public record QuoteData(String text, String author, List<String> tags) {
}
