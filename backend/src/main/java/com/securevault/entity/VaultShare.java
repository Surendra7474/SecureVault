package com.securevault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vault_shares")
public class VaultShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vault_item_id", nullable = false)
    private VaultItem vaultItem;

    @Column(name = "shared_with_email", nullable = false, length = 160)
    private String sharedWithEmail;

    @Column(name = "shared_at", updatable = false)
    private LocalDateTime sharedAt;

    public VaultShare() {
    }

    public VaultShare(Long id, VaultItem vaultItem, String sharedWithEmail, LocalDateTime sharedAt) {
        this.id = id;
        this.vaultItem = vaultItem;
        this.sharedWithEmail = sharedWithEmail;
        this.sharedAt = sharedAt;
    }

    @PrePersist
    protected void onCreate() {
        sharedAt = LocalDateTime.now();
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

    public VaultItem getVaultItem() {
        return vaultItem;
    }

    public void setVaultItem(VaultItem vaultItem) {
        this.vaultItem = vaultItem;
    }

    public String getSharedWithEmail() {
        return sharedWithEmail;
    }

    public void setSharedWithEmail(String sharedWithEmail) {
        this.sharedWithEmail = sharedWithEmail;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }

    // Builder

    public static class Builder {
        private Long id;
        private VaultItem vaultItem;
        private String sharedWithEmail;
        private LocalDateTime sharedAt;

        private Builder() {
        }

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder vaultItem(VaultItem vaultItem) {
            this.vaultItem = vaultItem;
            return this;
        }

        public Builder sharedWithEmail(String sharedWithEmail) {
            this.sharedWithEmail = sharedWithEmail;
            return this;
        }

        public Builder sharedAt(LocalDateTime sharedAt) {
            this.sharedAt = sharedAt;
            return this;
        }

        public VaultShare build() {
            return new VaultShare(id, vaultItem, sharedWithEmail, sharedAt);
        }
    }
}