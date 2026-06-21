package com.financesensei.api.dto;

public record AiProviderConfigRequest(
        String provider,
        String apiKey,
        String ollamaUrl,
        String ollamaModel) {
}
