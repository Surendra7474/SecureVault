package com.securevault.dto;

import com.securevault.entity.VaultItem;

import java.time.LocalDateTime;

public class VaultItemResponse {

    private Long id;
    private String title;
    private String username;
    private String maskedPassword;
    private String accessLevel;
    private boolean hasItemPin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VaultItemResponse() {
    }

    public VaultItemResponse(Long id, String title, String username, String maskedPassword,
                             String accessLevel, boolean hasItemPin, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.username = username;
        this.maskedPassword = maskedPassword;
        this.accessLevel = accessLevel;
        this.hasItemPin = hasItemPin;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getMaskedPassword() {
        return maskedPassword;
    }

    public void setMaskedPassword(String maskedPassword) {
        this.maskedPassword = maskedPassword;
    }

    public String getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(String accessLevel) {
        this.accessLevel = accessLevel;
    }

    public boolean isHasItemPin() {
        return hasItemPin;
    }

    public void setHasItemPin(boolean hasItemPin) {
        this.hasItemPin = hasItemPin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static VaultItemResponse from(VaultItem item) {
        return VaultItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .username(item.getUsername())
                .maskedPassword(null)
                .accessLevel(item.getAccessLevel().name())
                .hasItemPin(item.getItemPinHash() != null && !item.getItemPinHash().isBlank())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String title;
        private String username;
        private String maskedPassword;
        private String accessLevel;
        private boolean hasItemPin;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder maskedPassword(String maskedPassword) {
            this.maskedPassword = maskedPassword;
            return this;
        }

        public Builder accessLevel(String accessLevel) {
            this.accessLevel = accessLevel;
            return this;
        }

        public Builder hasItemPin(boolean hasItemPin) {
            this.hasItemPin = hasItemPin;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public VaultItemResponse build() {
            return new VaultItemResponse(id, title, username, maskedPassword, accessLevel, hasItemPin, createdAt, updatedAt);
        }
    }
}
