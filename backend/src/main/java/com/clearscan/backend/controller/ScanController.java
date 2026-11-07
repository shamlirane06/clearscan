package com.clearscan.backend.controller;

import com.clearscan.backend.dto.ScanRequest;
import com.clearscan.backend.dto.ScanResponse;
import com.clearscan.backend.service.UrlAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ScanController {

    private final UrlAnalysisService urlAnalysisService;

    public ScanController(UrlAnalysisService urlAnalysisService) {
        this.urlAnalysisService = urlAnalysisService;
    }

    @PostMapping("/scan")
    public ResponseEntity<ScanResponse> scanUrl(@Valid @RequestBody ScanRequest request) {
        ScanResponse response = urlAnalysisService.analyze(request.getUrl());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ClearScan backend is running");
    }
}
