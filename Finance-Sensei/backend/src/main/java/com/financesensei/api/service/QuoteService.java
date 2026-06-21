package com.financesensei.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financesensei.api.config.CacheConfig;
import com.financesensei.api.dto.QuoteData;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${quote.api.base-url:https://api.quotify.top}")
    private String quoteApiBaseUrl;

    @Cacheable(cacheNames = CacheConfig.CACHE_DAILY_QUOTE, key = "#p0 == null ? 'business|success' : #p0.toLowerCase().trim()")
    public QuoteData getRandomQuote(String tags) {
        String normalizedTags = (tags == null || tags.isBlank())
            ? "business,success"
            : tags.trim().toLowerCase().replace("|", ",");

        try {
            String url = UriComponentsBuilder
                .fromHttpUrl(quoteApiBaseUrl)
                .path("/random")
                .queryParam("tags", normalizedTags)
                .build()
                .encode()
                .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return fallbackQuote();
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode source = (root.has("data") && root.get("data").isObject()) ? root.get("data") : root;

            String text = firstText(source, "quote", "content", "text", "message");
            if (text == null || text.isBlank()) {
                return fallbackQuote();
            }

            String author = firstText(source, "author", "by", "source");
            if (author == null || author.isBlank()) {
                author = "Unknown";
            }

            List<String> parsedTags = parseTags(source.get("tags"), source.get("tag"));
            return new QuoteData(text.trim(), author.trim(), parsedTags);
        } catch (RestClientException ex) {
            return fallbackQuote();
        } catch (Exception ex) {
            return fallbackQuote();
        }
    }

    private QuoteData fallbackQuote() {
        return new QuoteData(
                "Discipline beats intensity. Small consistent steps compound into big financial outcomes.",
                "Finance Sensei",
                List.of("business", "success"));
    }

    private String firstText(JsonNode source, String... fields) {
        for (String field : fields) {
            JsonNode node = source.get(field);
            if (node != null && !node.isNull() && node.isTextual()) {
                return node.asText();
            }
        }
        return null;
    }

    private List<String> parseTags(JsonNode tagsNode, JsonNode tagNode) {
        List<String> tags = new ArrayList<>();
        if (tagsNode != null && tagsNode.isArray()) {
            tagsNode.forEach(tag -> {
                if (tag != null && !tag.isNull() && tag.isTextual() && !tag.asText().isBlank()) {
                    tags.add(tag.asText().trim());
                }
            });
            return tags;
        }

        if (tagNode != null && !tagNode.isNull() && tagNode.isTextual() && !tagNode.asText().isBlank()) {
            tags.add(tagNode.asText().trim());
        }
        return tags;
    }
}
