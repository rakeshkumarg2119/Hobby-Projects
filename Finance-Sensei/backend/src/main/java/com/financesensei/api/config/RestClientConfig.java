package com.financesensei.api.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestClientConfig {

    @Bean
    public RestTemplate restTemplate(
            RestTemplateBuilder builder,
            @Value("${external.api.timeout-seconds:10}") long timeoutSeconds) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(timeoutSeconds))
                .setReadTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();
    }
}
