package com.financesensei.api.dto;

import java.util.List;

public record AiChatRequest(
        String provider,
        String systemPrompt,
        List<AiMessage> messages,
    String apiKey,
        String ollamaModel,
        String ollamaUrl) {

    public record AiMessage(String role, String content) {
    }
}
