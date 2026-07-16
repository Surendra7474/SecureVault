package com.securevault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "vault_item_id")
    private Long vaultItemId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Action action;

    @Column(length = 255)
    private String details;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Action {
        CREATED, VIEWED, COPIED, MODIFIED, SHARED, DELETED, PIN_FAILED, SIGN_IN, SIGN_OUT
    }

    public AuditLog() {
    }

    public AuditLog(Long id, User user, Long vaultItemId, Action action, String details, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.vaultItemId = vaultItemId;
        this.action = action;
        this.details = details;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getVaultItemId() {
        return vaultItemId;
    }

    public void setVaultItemId(Long vaultItemId) {
        this.vaultItemId = vaultItemId;
    }

    public Action getAction() {
        return action;
    }

    public void setAction(Action action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder

    public static class Builder {
        private Long id;
        private User user;
        private Long vaultItemId;
        private Action action;
        private String details;
        private LocalDateTime createdAt;

        private Builder() {
        }

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder vaultItemId(Long vaultItemId) {
            this.vaultItemId = vaultItemId;
            return this;
        }

        public Builder action(Action action) {
            this.action = action;
            return this;
        }

        public Builder details(String details) {
            this.details = details;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AuditLog build() {
            return new AuditLog(id, user, vaultItemId, action, details, createdAt);
        }
    }
}
