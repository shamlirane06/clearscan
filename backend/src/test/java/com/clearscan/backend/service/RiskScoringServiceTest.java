package com.clearscan.backend.service;

import com.clearscan.backend.model.RiskClassification;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class RiskScoringServiceTest {
    private final RiskScoringService service = new RiskScoringService();

    @Test void mapsEveryScoreCategoryAndUnableState() {
        assertEquals(RiskClassification.LOW_RISK, service.classify(24));
        assertEquals(RiskClassification.MODERATE_RISK, service.classify(25));
        assertEquals(RiskClassification.HIGH_RISK, service.classify(50));
        assertEquals(RiskClassification.CRITICAL_RISK, service.classify(75));
        assertEquals(RiskClassification.UNABLE_TO_VERIFY, service.classify(-1));
    }
}
