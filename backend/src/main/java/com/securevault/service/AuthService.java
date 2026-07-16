package com.securevault.service;

import com.securevault.dto.*;
import com.securevault.entity.PasswordResetToken;
import com.securevault.entity.User;
import com.securevault.exception.DuplicateResourceException;
import com.securevault.exception.ResourceNotFoundException;
import com.securevault.repository.PasswordResetTokenRepository;
import com.securevault.repository.UserRepository;
import com.securevault.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RateLimiterService rateLimiterService;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RateLimiterService rateLimiterService,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rateLimiterService = rateLimiterService;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .pinHash(passwordEncoder.encode(request.getPin()))
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.of(accessToken, refreshToken, UserDto.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        rateLimiterService.checkLoginRateLimit(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    rateLimiterService.recordFailedLogin(request.getEmail());
                    return new BadCredentialsException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            rateLimiterService.recordFailedLogin(request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        rateLimiterService.resetLoginAttempts(request.getEmail());

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        auditService.logSignIn(user);

        return AuthResponse.of(accessToken, refreshToken, UserDto.from(user));
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken) || jwtService.isAccessToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        Long userId = jwtService.extractUserId(refreshToken);
        String email = jwtService.extractEmail(refreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.of(newAccessToken, newRefreshToken, UserDto.from(user));
    }

    public void signOut(User user) {
        auditService.logSignOut(user);
    }

    public boolean verifyPin(User user, String pin) {
        rateLimiterService.checkPinRateLimit(user);
        boolean matches = passwordEncoder.matches(pin, user.getPinHash());
        rateLimiterService.recordPinAttempt(user, matches);
        if (!matches) {
            auditService.logPinFailed(user);
        }
        return matches;
    }

    @Transactional
    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email"));

        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        tokenRepository.save(resetToken);

        // In production: send email with the reset token/link
        // mailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new BadCredentialsException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }
}
