package com.clearscan.backend.analyzer;

import com.clearscan.backend.model.SecurityCheckResult;
import java.net.URI;
import java.util.List;

public interface SecurityAnalyzer {
    List<SecurityCheckResult> analyze(String rawUrl, URI parsedUri);
}
