package com.financesensei.api.service;

import com.financesensei.api.dto.AiProviderConfigRequest;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class AiProviderConfigService {

    private final Map<String, ProviderConfig> providerConfigs = new ConcurrentHashMap<>();

    public void upsert(AiProviderConfigRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        String provider = normalizeProvider(request.provider());
        ProviderConfig existing = providerConfigs.get(provider);

        String apiKey = normalizeField(request.apiKey());
        String ollamaUrl = normalizeField(request.ollamaUrl());
        String ollamaModel = normalizeField(request.ollamaModel());

        if (existing != null) {
            if (apiKey == null) apiKey = existing.apiKey();
            if (ollamaUrl == null) ollamaUrl = existing.ollamaUrl();
            if (ollamaModel == null) ollamaModel = existing.ollamaModel();
        }

        providerConfigs.put(provider, new ProviderConfig(apiKey, ollamaUrl, ollamaModel));
    }

    public ProviderConfig getForProvider(String provider) {
        return providerConfigs.get(normalizeProvider(provider));
    }

    public void clearAll() {
        providerConfigs.clear();
    }

    private String normalizeProvider(String provider) {
        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException("provider is required (gemini, groq, ollama, or other)");
        }

        String normalized = provider.trim().toLowerCase(Locale.ROOT);
        if (!normalized.equals("gemini") && !normalized.equals("groq") && !normalized.equals("ollama") && !normalized.equals("other")) {
            throw new IllegalArgumentException("Unsupported provider: " + normalized);
        }
        return normalized;
    }

    private String normalizeField(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    public record ProviderConfig(String apiKey, String ollamaUrl, String ollamaModel) {
    }
}
