package com.securevault.repository;

import com.securevault.entity.VaultItem;
import com.securevault.entity.VaultShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaultShareRepository extends JpaRepository<VaultShare, Long> {
    List<VaultShare> findByVaultItem(VaultItem vaultItem);
    List<VaultShare> findBySharedWithEmail(String email);
    boolean existsByVaultItemAndSharedWithEmail(VaultItem vaultItem, String email);
}
