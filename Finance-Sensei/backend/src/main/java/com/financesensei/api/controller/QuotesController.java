package com.financesensei.api.controller;

import com.financesensei.api.dto.ApiResponse;
import com.financesensei.api.dto.QuoteData;
import com.financesensei.api.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuotesController {

    private final QuoteService quoteService;

    @GetMapping("/daily")
    public ApiResponse<QuoteData> getDailyQuote(@RequestParam(defaultValue = "business|success") String tags) {
        QuoteData data = quoteService.getRandomQuote(tags);
        return ApiResponse.success(data, "Quotify");
    }
}
