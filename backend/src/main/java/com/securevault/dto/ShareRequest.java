package com.securevault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ShareRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    public ShareRequest() {
    }

    public ShareRequest(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String email;

        public Builder email(String email) { this.email = email; return this; }

        public ShareRequest build() { return new ShareRequest(email); }
    }
}
