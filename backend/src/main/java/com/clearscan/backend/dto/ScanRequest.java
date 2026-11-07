package com.clearscan.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ScanRequest {
    @NotBlank(message = "URL must not be empty")
    @Size(max = 2048, message = "URL must not exceed 2048 characters")
    private String url;

    public ScanRequest() {}
    public ScanRequest(String url) { this.url = url; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
