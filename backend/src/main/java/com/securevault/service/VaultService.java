package com.securevault.service;

import com.securevault.dto.*;
import com.securevault.entity.User;
import com.securevault.entity.VaultItem;
import com.securevault.entity.VaultShare;
import com.securevault.exception.PinVerificationRequiredException;
import com.securevault.exception.ResourceNotFoundException;
import com.securevault.repository.UserRepository;
import com.securevault.repository.VaultItemRepository;
import com.securevault.repository.VaultShareRepository;
import com.securevault.util.AesEncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaultService {

    private static final Logger log = LoggerFactory.getLogger(VaultService.class);

    private final VaultItemRepository vaultItemRepository;
    private final VaultShareRepository vaultShareRepository;
    private final UserRepository userRepository;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    public VaultService(VaultItemRepository vaultItemRepository,
                        VaultShareRepository vaultShareRepository,
                        UserRepository userRepository,
                        AesEncryptionUtil aesEncryptionUtil,
                        AuditService auditService,
                        PasswordEncoder passwordEncoder) {
        this.vaultItemRepository = vaultItemRepository;
        this.vaultShareRepository = vaultShareRepository;
        this.userRepository = userRepository;
        this.aesEncryptionUtil = aesEncryptionUtil;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<VaultItemResponse> getUserVault(User user, String search) {
        List<VaultItem> items;
        if (search != null && !search.isBlank()) {
            items = vaultItemRepository.searchByOwner(user, search.trim());
        } else {
            items = vaultItemRepository.findAllAccessibleByUser(user, user.getEmail());
        }
        return items.stream()
                .map(VaultItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public VaultItemResponse createVaultItem(User user, VaultItemRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        AesEncryptionUtil.EncryptedData encrypted = aesEncryptionUtil.encrypt(request.getPassword());

        VaultItem.AccessLevel accessLevel;
        try {
            accessLevel = VaultItem.AccessLevel.valueOf(request.getAccessLevel().toUpperCase());
        } catch (Exception e) {
            accessLevel = VaultItem.AccessLevel.PRIVATE;
        }

        if (accessLevel == VaultItem.AccessLevel.PRIVATE) {
            if (request.getItemPin() == null || request.getItemPin().isBlank()) {
                throw new IllegalArgumentException("Item PIN is required for Private items");
            }
        } else if (accessLevel == VaultItem.AccessLevel.SHARED) {
            if (request.getVerificationPin() == null || request.getVerificationPin().isBlank()) {
                throw new PinVerificationRequiredException("Account PIN verification is required to create a Shared item");
            }
            if (!passwordEncoder.matches(request.getVerificationPin(), user.getPinHash())) {
                auditService.logPinFailed(user);
                throw new IllegalArgumentException("Invalid account PIN");
            }
        }

        VaultItem item = VaultItem.builder()
                .owner(user)
                .title(request.getTitle())
                .username(request.getUsername())
                .encryptedPassword(encrypted.ciphertext())
                .iv(encrypted.iv())
                .accessLevel(accessLevel)
                .build();

        if (accessLevel == VaultItem.AccessLevel.PRIVATE) {
            item.setItemPinHash(passwordEncoder.encode(request.getItemPin()));
        }

        item = vaultItemRepository.save(item);
        auditService.logCreated(user, item.getId(), item.getTitle());

        return VaultItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public VaultItemResponse getVaultItem(User user, Long id) {
        VaultItem item = findAndAuthorize(user, id);
        return VaultItemResponse.from(item);
    }

    @Transactional
    public VaultItemResponse updateVaultItem(User user, Long id, VaultItemRequest request) {
        VaultItem item = findOwnedItem(user, id);

        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        if (request.getUsername() != null) {
            item.setUsername(request.getUsername());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            AesEncryptionUtil.EncryptedData encrypted = aesEncryptionUtil.encrypt(request.getPassword());
            item.setEncryptedPassword(encrypted.ciphertext());
            item.setIv(encrypted.iv());
        }

        if (request.getAccessLevel() != null) {
            VaultItem.AccessLevel accessLevel;
            try {
                accessLevel = VaultItem.AccessLevel.valueOf(request.getAccessLevel().toUpperCase());
            } catch (Exception e) {
                accessLevel = item.getAccessLevel();
            }

            boolean isChanging = !accessLevel.equals(item.getAccessLevel());

            if (isChanging) {
                if (accessLevel == VaultItem.AccessLevel.PRIVATE) {
                    // Switching to PRIVATE: require a new item PIN
                    if (request.getItemPin() == null || request.getItemPin().isBlank()) {
                        throw new IllegalArgumentException("Item PIN is required when switching to Private");
                    }
                    item.setItemPinHash(passwordEncoder.encode(request.getItemPin()));
                } else if (accessLevel == VaultItem.AccessLevel.SHARED) {
                    // Switching to SHARED: require account PIN verification
                    if (request.getVerificationPin() == null || request.getVerificationPin().isBlank()) {
                        throw new PinVerificationRequiredException("Account PIN verification is required to switch a Private item to Shared");
                    }
                    if (!passwordEncoder.matches(request.getVerificationPin(), user.getPinHash())) {
                        auditService.logPinFailed(user);
                        throw new IllegalArgumentException("Invalid account PIN");
                    }
                    // Clear item PIN hash when switching to Shared (shared items use account PIN)
                    item.setItemPinHash(null);
                }
            }

            item.setAccessLevel(accessLevel);
        }

        item = vaultItemRepository.save(item);
        auditService.logModified(user, item.getId(), item.getTitle());

        return VaultItemResponse.from(item);
    }

    @Transactional
    public void deleteVaultItem(User user, Long id) {
        VaultItem item = findOwnedItem(user, id);
        String title = item.getTitle();
        vaultItemRepository.delete(item);
        auditService.logDeleted(user, id, title);
    }

    @Transactional
    public RevealResponse revealPassword(User user, Long id) {
        VaultItem item = findAndAuthorize(user, id);
        String plaintext = aesEncryptionUtil.decrypt(item.getEncryptedPassword(), item.getIv());
        auditService.logViewed(user, item.getId(), item.getTitle());

        return RevealResponse.builder()
                .id(item.getId())
                .plaintextPassword(plaintext)
                .username(item.getUsername())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean verifyItemPin(User user, Long itemId, String pin) {
        VaultItem item = findAndAuthorize(user, itemId);

        if (item.getAccessLevel() == VaultItem.AccessLevel.PRIVATE) {
            if (item.getItemPinHash() == null || item.getItemPinHash().isBlank()) {
                log.warn("Item {} is PRIVATE but has no itemPinHash", itemId);
                auditService.logPinFailed(user);
                return false;
            }
            boolean matches = passwordEncoder.matches(pin, item.getItemPinHash());
            if (!matches) {
                auditService.logPinFailed(user);
            }
            return matches;
        } else {
            boolean matches = passwordEncoder.matches(pin, item.getOwner().getPinHash());
            if (!matches) {
                auditService.logPinFailed(user);
            }
            return matches;
        }
    }

    @Transactional
    public void logCopy(User user, Long id) {
        VaultItem item = findAndAuthorize(user, id);
        auditService.logCopied(user, item.getId(), item.getTitle());
    }

    @Transactional
    public void shareItem(User user, Long id, ShareRequest request) {
        VaultItem item = findOwnedItem(user, id);

        if (request.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Cannot share with yourself");
        }

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        if (vaultShareRepository.existsByVaultItemAndSharedWithEmail(item, request.getEmail())) {
            throw new IllegalArgumentException("Item already shared with this user");
        }

        VaultShare share = VaultShare.builder()
                .vaultItem(item)
                .sharedWithEmail(request.getEmail())
                .build();
        vaultShareRepository.save(share);

        item.setAccessLevel(VaultItem.AccessLevel.SHARED);
        vaultItemRepository.save(item);

        auditService.logShared(user, item.getId(), item.getTitle(), request.getEmail());
    }

    @Transactional
    public void removeShare(User user, Long id, String email) {
        VaultItem item = findOwnedItem(user, id);

        List<VaultShare> shares = vaultShareRepository.findByVaultItem(item);
        vaultShareRepository.deleteAll(
                shares.stream()
                        .filter(s -> s.getSharedWithEmail().equalsIgnoreCase(email))
                        .collect(Collectors.toList())
        );

        List<VaultShare> remaining = vaultShareRepository.findByVaultItem(item);
        if (remaining.isEmpty()) {
            item.setAccessLevel(VaultItem.AccessLevel.PRIVATE);
            vaultItemRepository.save(item);
        }
    }

    @Transactional(readOnly = true)
    public String generatePassword() {
        return com.securevault.util.PasswordGeneratorUtil.generate();
    }

    private VaultItem findAndAuthorize(User user, Long id) {
        VaultItem item = vaultItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vault item not found"));

        if (!item.getOwner().getId().equals(user.getId())) {
            boolean isShared = vaultShareRepository.existsByVaultItemAndSharedWithEmail(item, user.getEmail());
            if (!isShared) {
                throw new ResourceNotFoundException("Vault item not found");
            }
        }

        return item;
    }

    private VaultItem findOwnedItem(User user, Long id) {
        VaultItem item = vaultItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vault item not found"));

        if (!item.getOwner().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Vault item not found");
        }

        return item;
    }
}
