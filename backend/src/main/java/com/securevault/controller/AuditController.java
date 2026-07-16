package com.securevault.controller;

import com.securevault.entity.AuditLog;
import com.securevault.entity.User;
import com.securevault.service.AuditService;
import com.securevault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;
    private final UserService userService;

    public AuditController(AuditService auditService, UserService userService) {
        this.auditService = auditService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getUserAuditLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(auditService.getUserAuditLogs(user));
    }

    @GetMapping("/item/{vaultItemId}")
    public ResponseEntity<List<AuditLog>> getItemAuditLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long vaultItemId) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(auditService.getItemAuditLogs(user, vaultItemId));
    }
}
