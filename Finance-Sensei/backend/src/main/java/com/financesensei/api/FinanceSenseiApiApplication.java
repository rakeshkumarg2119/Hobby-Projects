package com.financesensei.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class FinanceSenseiApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceSenseiApiApplication.class, args);
	}

}
