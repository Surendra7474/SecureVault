package com.securevault.repository;

import com.securevault.entity.AuditLog;
import com.securevault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserOrderByCreatedAtDesc(User user);
    List<AuditLog> findByUserAndVaultItemIdOrderByCreatedAtDesc(User user, Long vaultItemId);
}
