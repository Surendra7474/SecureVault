package com.securevault.controller;

import com.securevault.dto.*;
import com.securevault.entity.User;
import com.securevault.service.UserService;
import com.securevault.service.VaultService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vault")
public class VaultController {

    private final VaultService vaultService;
    private final UserService userService;

    public VaultController(VaultService vaultService, UserService userService) {
        this.vaultService = vaultService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<VaultItemResponse>> getVault(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String search) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(vaultService.getUserVault(user, search));
    }

    @PostMapping
    public ResponseEntity<VaultItemResponse> createItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VaultItemRequest request) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(vaultService.createVaultItem(user, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VaultItemResponse> getItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(vaultService.getVaultItem(user, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VaultItemResponse> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody VaultItemRequest request) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(vaultService.updateVaultItem(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(userDetails);
        vaultService.deleteVaultItem(user, id);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }

    @PostMapping("/{id}/verify-item-pin")
    public ResponseEntity<Map<String, Boolean>> verifyItemPin(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody PinRequest request) {
        User user = userService.getCurrentUser(userDetails);
        boolean valid = vaultService.verifyItemPin(user, id, request.getPin());
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @PostMapping("/{id}/reveal")
    public ResponseEntity<RevealResponse> revealPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(userDetails);
        return ResponseEntity.ok(vaultService.revealPassword(user, id));
    }

    @PostMapping("/{id}/copy")
    public ResponseEntity<Map<String, String>> logCopy(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(userDetails);
        vaultService.logCopy(user, id);
        return ResponseEntity.ok(Map.of("message", "Copy logged"));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<Map<String, String>> shareItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ShareRequest request) {
        User user = userService.getCurrentUser(userDetails);
        vaultService.shareItem(user, id, request);
        return ResponseEntity.ok(Map.of("message", "Item shared successfully"));
    }

    @GetMapping("/generate-password")
    public ResponseEntity<Map<String, String>> generatePassword() {
        return ResponseEntity.ok(Map.of("password", vaultService.generatePassword()));
    }
}
