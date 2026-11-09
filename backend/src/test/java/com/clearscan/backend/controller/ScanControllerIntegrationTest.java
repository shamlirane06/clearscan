package com.clearscan.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "clearscan.threat-intel.enabled=false",
        "clearscan.threat-intel.api-key="
})
class ScanControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void safeDemoReturnsBackendScoreAndExplicitThreatIntelAvailability() throws Exception {
        scan("https://www.wikipedia.org")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskClassification").value("LOW_RISK"))
                .andExpect(jsonPath("$.analysisSource").value("BACKEND"))
                .andExpect(jsonPath("$.threatIntelligenceStatus").value("NOT_CONFIGURED"))
                .andExpect(jsonPath("$.status").value("UNABLE_TO_VERIFY"));
    }

    @Test
    void syntheticPhishingDemoReturnsCalculatedEvidenceAndScore() throws Exception {
        scan("http://sbi-kyc-update.xyz/verify")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").value(56))
                .andExpect(jsonPath("$.riskClassification").value("HIGH_RISK"))
                .andExpect(jsonPath("$.securityChecks.length()").isNumber())
                .andExpect(jsonPath("$.warnings.length()").value(org.hamcrest.Matchers.greaterThan(0)))
                .andExpect(jsonPath("$.recommendedAction").isNotEmpty());
    }

    @Test
    void privateHostAndNonHttpInputAreUnverifiable() throws Exception {
        scan("http://localhost:8080/secret")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").value(-1))
                .andExpect(jsonPath("$.riskClassification").value("UNABLE_TO_VERIFY"));
        scan("upi://pay?pa=demostore%40upi&pn=Demo%20Store&am=100&cu=INR")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").value(-1))
                .andExpect(jsonPath("$.riskClassification").value("UNABLE_TO_VERIFY"));
    }

    private org.springframework.test.web.servlet.ResultActions scan(String url) throws Exception {
        String body = "{\"url\":\"" + url.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}";
        return mockMvc.perform(post("/api/scan")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }
}
