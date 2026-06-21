package com.financesensei.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financesensei.api.dto.AiChatRequest;
import com.financesensei.api.exception.ExternalApiException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
public class AiGatewayService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiProviderConfigService aiProviderConfigService;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.model:llama3-8b-8192}")
    private String groqModel;

    @Value("${ai.ollama.default-url:http://localhost:11434}")
    private String defaultOllamaUrl;

    public String chat(AiChatRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        String provider = normalizeProvider(request.provider());
        return switch (provider) {
            case "gemini" -> callGemini(request);
            case "groq" -> callGroq(request);
            case "ollama" -> callOllama(request);
            case "other" -> callOtherApi(request);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }

    private String callGemini(AiChatRequest request) {
        String configuredGeminiKey = getConfiguredApiKey("gemini");
        String requestGeminiKey = request.apiKey() == null ? null : request.apiKey().trim();
        String effectiveGeminiKey = (requestGeminiKey == null || requestGeminiKey.isBlank()) ? configuredGeminiKey : requestGeminiKey;

        if (effectiveGeminiKey == null || effectiveGeminiKey.isBlank()) {
            throw new ExternalApiException("Gemini API key is missing. Add your key in app settings after signing in.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + effectiveGeminiKey;

        List<Map<String, Object>> contents = new ArrayList<>();
        for (AiChatRequest.AiMessage message : safeMessages(request.messages())) {
            String role = "assistant".equalsIgnoreCase(message.role()) ? "model" : "user";
            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", safeText(message.content())))));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", safeText(request.systemPrompt())))));
        body.put("contents", contents);
        body.put("generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 1024));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ExternalApiException("Gemini API returned an unexpected response status");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.isNull() || textNode.asText().isBlank()) {
                throw new ExternalApiException("Gemini API returned an empty response");
            }
            return textNode.asText();
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to call Gemini API", ex);
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to parse Gemini API response", ex);
        }
    }

    private String callGroq(AiChatRequest request) {
        String configuredGroqKey = getConfiguredApiKey("groq");
        String requestGroqKey = request.apiKey() == null ? null : request.apiKey().trim();
        String effectiveGroqKey = (requestGroqKey == null || requestGroqKey.isBlank()) ? configuredGroqKey : requestGroqKey;

        if (effectiveGroqKey == null || effectiveGroqKey.isBlank()) {
            throw new ExternalApiException("Groq API key is missing. Add your key in app settings after signing in.");
        }

        String url = "https://api.groq.com/openai/v1/chat/completions";
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", safeText(request.systemPrompt())));
        for (AiChatRequest.AiMessage message : safeMessages(request.messages())) {
            messages.add(Map.of(
                    "role", "assistant".equalsIgnoreCase(message.role()) ? "assistant" : "user",
                    "content", safeText(message.content())));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", groqModel);
        body.put("messages", messages);
        body.put("max_tokens", 1024);
        body.put("temperature", 0.7);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + effectiveGroqKey);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ExternalApiException("Groq API returned an unexpected response status");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("choices").path(0).path("message").path("content");
            if (textNode.isMissingNode() || textNode.isNull() || textNode.asText().isBlank()) {
                throw new ExternalApiException("Groq API returned an empty response");
            }
            return textNode.asText();
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to call Groq API", ex);
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to parse Groq API response", ex);
        }
    }

    private String callOllama(AiChatRequest request) {
        AiProviderConfigService.ProviderConfig config = aiProviderConfigService.getForProvider("ollama");

        String configuredUrl = config == null ? null : config.ollamaUrl();
        String requestUrl = request.ollamaUrl();
        String effectiveUrl = (requestUrl == null || requestUrl.isBlank()) ? configuredUrl : requestUrl;
        String baseUrl = normalizeOllamaUrl(effectiveUrl);

        String configuredModel = config == null ? null : config.ollamaModel();
        String requestModel = request.ollamaModel();
        String model = (requestModel == null || requestModel.isBlank())
            ? (configuredModel == null || configuredModel.isBlank() ? "llama3" : configuredModel.trim())
            : requestModel.trim();

        String url = baseUrl + "/api/chat";
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", safeText(request.systemPrompt())));
        for (AiChatRequest.AiMessage message : safeMessages(request.messages())) {
            messages.add(Map.of(
                    "role", "assistant".equalsIgnoreCase(message.role()) ? "assistant" : "user",
                    "content", safeText(message.content())));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("stream", false);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ExternalApiException("Ollama API returned an unexpected response status");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("message").path("content");
            if (textNode.isMissingNode() || textNode.isNull() || textNode.asText().isBlank()) {
                throw new ExternalApiException("Ollama API returned an empty response");
            }
            return textNode.asText();
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to call Ollama API", ex);
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to parse Ollama API response", ex);
        }
    }

    private String normalizeProvider(String provider) {
        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException("provider is required (gemini, groq, ollama, or other)");
        }
        return provider.trim().toLowerCase(Locale.ROOT);
    }

    private String callOtherApi(AiChatRequest request) {
        AiProviderConfigService.ProviderConfig config = aiProviderConfigService.getForProvider("other");

        String requestKey = request.apiKey() == null ? null : request.apiKey().trim();
        String configKey = config == null ? null : config.apiKey();
        String apiKey = (requestKey == null || requestKey.isBlank()) ? configKey : requestKey;

        if (apiKey == null || apiKey.isBlank()) {
            throw new ExternalApiException("Other API key is missing. Add your key in app settings.");
        }

        String requestBaseUrl = request.ollamaUrl() == null ? null : request.ollamaUrl().trim();
        String configBaseUrl = config == null ? null : config.ollamaUrl();
        String baseUrl = (requestBaseUrl == null || requestBaseUrl.isBlank()) ? configBaseUrl : requestBaseUrl;

        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ExternalApiException("Other API URL is missing. Add your endpoint URL in app settings.");
        }

        String requestModel = request.ollamaModel() == null ? null : request.ollamaModel().trim();
        String configModel = config == null ? null : config.ollamaModel();
        String model = (requestModel == null || requestModel.isBlank())
                ? (configModel == null || configModel.isBlank() ? "gpt-4o-mini" : configModel.trim())
                : requestModel;

        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String url = normalizedBaseUrl.endsWith("/v1/chat/completions")
                ? normalizedBaseUrl
                : normalizedBaseUrl + "/v1/chat/completions";

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", safeText(request.systemPrompt())));
        for (AiChatRequest.AiMessage message : safeMessages(request.messages())) {
            messages.add(Map.of(
                    "role", "assistant".equalsIgnoreCase(message.role()) ? "assistant" : "user",
                    "content", safeText(message.content())));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("max_tokens", 1024);
        body.put("temperature", 0.7);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ExternalApiException("Other API returned an unexpected response status");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("choices").path(0).path("message").path("content");
            if (textNode.isMissingNode() || textNode.isNull() || textNode.asText().isBlank()) {
                throw new ExternalApiException("Other API returned an empty response");
            }

            return textNode.asText();
        } catch (RestClientException ex) {
            throw new ExternalApiException("Failed to call Other API", ex);
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to parse Other API response", ex);
        }
    }

    private String normalizeOllamaUrl(String configuredUrl) {
        String url = (configuredUrl == null || configuredUrl.isBlank()) ? defaultOllamaUrl : configuredUrl.trim();
        if (url.endsWith("/")) {
            return url.substring(0, url.length() - 1);
        }
        return url;
    }

    private List<AiChatRequest.AiMessage> safeMessages(List<AiChatRequest.AiMessage> messages) {
        return messages == null ? List.of() : messages;
    }

    private String safeText(String text) {
        return text == null ? "" : text;
    }

    private String getConfiguredApiKey(String provider) {
        AiProviderConfigService.ProviderConfig config = aiProviderConfigService.getForProvider(provider);
        if (config == null || config.apiKey() == null || config.apiKey().isBlank()) {
            return null;
        }
        return config.apiKey();
    }
}
