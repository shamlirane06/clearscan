package com.clearscan.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient(@Value("${clearscan.threat-intel.timeout-ms:5000}") int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        int boundedTimeout = Math.max(250, Math.min(timeoutMs, 15000));
        factory.setConnectTimeout((int) Duration.ofMillis(boundedTimeout).toMillis());
        factory.setReadTimeout((int) Duration.ofMillis(boundedTimeout).toMillis());

        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }
}
