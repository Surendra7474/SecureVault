package com.securevault.service;

import com.securevault.dto.UserDto;
import com.securevault.entity.User;
import com.securevault.exception.ResourceNotFoundException;
import com.securevault.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateProfile(UserDetails userDetails, String name, String phoneNumber, String currentPin, String newPin) {
        User user = getCurrentUser(userDetails);

        if (user.getPinHash() == null || user.getPinHash().isBlank()) {
            throw new BadCredentialsException("No PIN set for this account");
        }

        if (!passwordEncoder.matches(currentPin, user.getPinHash())) {
            auditService.logPinFailed(user);
            throw new BadCredentialsException("Current PIN is incorrect");
        }

        user.setName(name);
        user.setPhoneNumber(phoneNumber);
        if (newPin != null && !newPin.isBlank()) {
            user.setPinHash(passwordEncoder.encode(newPin));
        }
        user = userRepository.save(user);
        return UserDto.from(user);
    }
}
