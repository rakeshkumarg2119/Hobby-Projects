package com.financesensei.api.controller;

import com.financesensei.api.dto.AiChatData;
import com.financesensei.api.dto.AiChatRequest;
import com.financesensei.api.dto.AiProviderConfigRequest;
import com.financesensei.api.dto.ApiResponse;
import com.financesensei.api.service.AiProviderConfigService;
import com.financesensei.api.service.AiGatewayService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiGatewayService aiGatewayService;
    private final AiProviderConfigService aiProviderConfigService;

    @PostMapping("/chat")
    public ApiResponse<AiChatData> chat(@RequestBody AiChatRequest request) {
        String reply = aiGatewayService.chat(request);
        return ApiResponse.success(new AiChatData(reply), "finance-sensei-ai-gateway");
    }

    @PostMapping("/config")
    public ApiResponse<Map<String, String>> configureProvider(@RequestBody AiProviderConfigRequest request) {
        aiProviderConfigService.upsert(request);
        return ApiResponse.success(Map.of("message", "Provider config saved"), "finance-sensei-ai-gateway");
    }

    @PostMapping("/config/clear")
    public ApiResponse<Map<String, String>> clearProviderConfig() {
        aiProviderConfigService.clearAll();
        return ApiResponse.success(Map.of("message", "Provider config cleared"), "finance-sensei-ai-gateway");
    }
}
