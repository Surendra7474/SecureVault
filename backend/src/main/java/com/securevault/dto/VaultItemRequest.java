package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class VaultItemRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 160)
    private String title;

    @Size(max = 120)
    private String username;

    @Size(max = 255)
    private String password;

    @Pattern(regexp = "^[0-9]{4,6}$", message = "Item PIN must be 4-6 digits")
    private String itemPin;

    private String accessLevel;

    private String verificationPin;

    public VaultItemRequest() {
    }

    public VaultItemRequest(String title, String username, String password, String itemPin, String accessLevel, String verificationPin) {
        this.title = title;
        this.username = username;
        this.password = password;
        this.itemPin = itemPin;
        this.accessLevel = accessLevel;
        this.verificationPin = verificationPin;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getItemPin() {
        return itemPin;
    }

    public void setItemPin(String itemPin) {
        this.itemPin = itemPin;
    }

    public String getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(String accessLevel) {
        this.accessLevel = accessLevel;
    }

    public String getVerificationPin() {
        return verificationPin;
    }

    public void setVerificationPin(String verificationPin) {
        this.verificationPin = verificationPin;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String title;
        private String username;
        private String password;
        private String itemPin;
        private String accessLevel;
        private String verificationPin;

        private Builder() {
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder password(String password) {
            this.password = password;
            return this;
        }

        public Builder itemPin(String itemPin) {
            this.itemPin = itemPin;
            return this;
        }

        public Builder accessLevel(String accessLevel) {
            this.accessLevel = accessLevel;
            return this;
        }

        public Builder verificationPin(String verificationPin) {
            this.verificationPin = verificationPin;
            return this;
        }

        public VaultItemRequest build() {
            return new VaultItemRequest(title, username, password, itemPin, accessLevel, verificationPin);
        }
    }
}
