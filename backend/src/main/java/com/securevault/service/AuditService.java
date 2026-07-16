package com.securevault.service;

import com.securevault.entity.AuditLog;
import com.securevault.entity.User;
import com.securevault.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    @Transactional
    public void logCreated(User user, Long vaultItemId, String title) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .vaultItemId(vaultItemId)
                .action(AuditLog.Action.CREATED)
                .details("Created vault item: " + title)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logViewed(User user, Long vaultItemId, String title) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .vaultItemId(vaultItemId)
                .action(AuditLog.Action.VIEWED)
                .details("Viewed password for: " + title)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logCopied(User user, Long vaultItemId, String title) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .vaultItemId(vaultItemId)
                .action(AuditLog.Action.COPIED)
                .details("Copied password for: " + title)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logModified(User user, Long vaultItemId, String title) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .vaultItemId(vaultItemId)
                .action(AuditLog.Action.MODIFIED)
                .details("Modified vault item: " + title)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logShared(User user, Long vaultItemId, String title, String sharedWith) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .vaultItemId(vaultItemId)
                .action(AuditLog.Action.SHARED)
                .details("Shared '" + title + "' with " + sharedWith)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logDeleted(User user, Long vaultItemId, String title) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .vaultItemId(vaultItemId)
                .action(AuditLog.Action.DELETED)
                .details("Deleted vault item: " + title)
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logPinFailed(User user) {
        try {
            AuditLog log = AuditLog.builder()
                    .user(user)
                    .action(AuditLog.Action.PIN_FAILED)
                    .details("Failed PIN verification attempt")
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to persist PIN_FAILED audit log for user {}", user.getId(), e);
        }
    }

    @Transactional
    public void logSignIn(User user) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(AuditLog.Action.SIGN_IN)
                .details("User signed in")
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public void logSignOut(User user) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(AuditLog.Action.SIGN_OUT)
                .details("User signed out")
                .build();
        auditLogRepository.save(log);
    }

    @Async
    @Transactional
    public void logPinFailed(User user, Long vaultItemId) {
        try {
            AuditLog log = AuditLog.builder()
                    .user(user)
                    .vaultItemId(vaultItemId)
                    .action(AuditLog.Action.PIN_FAILED)
                    .details("Failed PIN verification for item " + vaultItemId)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to persist PIN_FAILED audit log for user {} item {}", user.getId(), vaultItemId, e);
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getUserAuditLogs(User user) {
        return auditLogRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getItemAuditLogs(User user, Long vaultItemId) {
        return auditLogRepository.findByUserAndVaultItemIdOrderByCreatedAtDesc(user, vaultItemId);
    }
}
