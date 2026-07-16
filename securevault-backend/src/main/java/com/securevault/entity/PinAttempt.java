package com.securevault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pin_attempts")
public class PinAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Boolean success;

    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt;

    public PinAttempt() {
    }

    public PinAttempt(Long id, User user, Boolean success, LocalDateTime attemptedAt) {
        this.id = id;
        this.user = user;
        this.success = success;
        this.attemptedAt = attemptedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (attemptedAt == null) {
            attemptedAt = LocalDateTime.now();
        }
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

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    // Builder

    public static class Builder {
        private Long id;
        private User user;
        private Boolean success;
        private LocalDateTime attemptedAt;

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

        public Builder success(Boolean success) {
            this.success = success;
            return this;
        }

        public Builder attemptedAt(LocalDateTime attemptedAt) {
            this.attemptedAt = attemptedAt;
            return this;
        }

        public PinAttempt build() {
            return new PinAttempt(id, user, success, attemptedAt);
        }
    }
}