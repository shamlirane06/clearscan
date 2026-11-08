package com.clearscan.backend.analyzer;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class ThreatIntelligenceAnalyzerTest {
    @Test void missingKeyIsNotConfiguredAndNotSafe() {
        var analyzer = new ThreatIntelligenceAnalyzer(RestClient.builder().requestFactory(new SimpleClientHttpRequestFactory()).build(), "", true);
        var outcome = analyzer.analyzeWithStatus("https://example.com");
        assertEquals(ThreatIntelligenceAnalyzer.Status.NOT_CONFIGURED, outcome.status());
        assertFalse(outcome.checks().get(0).isPassed());
    }

    @Test void parsesEmptyMatchesAsCheckedNoMatchAndEscapesPayloadWithJsonEncoder() {
        RestClient.Builder builder = RestClient.builder().requestFactory(new SimpleClientHttpRequestFactory());
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(org.hamcrest.Matchers.containsString("threatMatches:find?key=test-key")))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("safe-look\\\"up")))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        var analyzer = new ThreatIntelligenceAnalyzer(builder.build(), "test-key", true);
        var outcome = analyzer.analyzeWithStatus("https://example.com/safe-look\"up?q=one");
        assertEquals(ThreatIntelligenceAnalyzer.Status.CHECKED_NO_MATCH, outcome.status());
        assertTrue(outcome.checks().get(0).isPassed());
        server.verify();
    }

    @Test void parsesMatchesAsThreatAndServiceErrorsAsUnavailable() {
        RestClient.Builder builder = RestClient.builder().requestFactory(new SimpleClientHttpRequestFactory());
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(org.hamcrest.Matchers.containsString("threatMatches:find")))
                .andRespond(withSuccess("{\"matches\":[{\"threatType\":\"MALWARE\",\"platformType\":\"ANY_PLATFORM\",\"threatEntryType\":\"URL\"}]}", MediaType.APPLICATION_JSON));
        server.expect(requestTo(org.hamcrest.Matchers.containsString("threatMatches:find")))
                .andRespond(withStatus(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS));
        var analyzer = new ThreatIntelligenceAnalyzer(builder.build(), "test-key", true);
        var match = analyzer.analyzeWithStatus("https://example.com/a");
        var rateLimit = analyzer.analyzeWithStatus("https://example.com/b");
        assertEquals(ThreatIntelligenceAnalyzer.Status.MATCH_FOUND, match.status());
        assertEquals(ThreatIntelligenceAnalyzer.Status.UNAVAILABLE, rateLimit.status());
        assertFalse(rateLimit.checks().get(0).isPassed());
        server.verify();
    }

    @Test void malformedThreatResponseIsUnavailable() {
        RestClient.Builder builder = RestClient.builder().requestFactory(new SimpleClientHttpRequestFactory());
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(org.hamcrest.Matchers.containsString("threatMatches:find")))
                .andRespond(withSuccess("{\"matches\":\"not-an-array\"}", MediaType.APPLICATION_JSON));
        var analyzer = new ThreatIntelligenceAnalyzer(builder.build(), "test-key", true);
        assertEquals(ThreatIntelligenceAnalyzer.Status.UNAVAILABLE, analyzer.analyzeWithStatus("https://example.com").status());
        server.verify();
    }
}
