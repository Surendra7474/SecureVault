package com.securevault.service;

import com.securevault.entity.PinAttempt;
import com.securevault.entity.User;
import com.securevault.exception.RateLimitExceededException;
import com.securevault.repository.PinAttemptRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final PinAttemptRepository pinAttemptRepository;

    @Value("${app.rate-limit.login-max-attempts}")
    private int loginMaxAttempts;

    @Value("${app.rate-limit.login-window-minutes}")
    private int loginWindowMinutes;

    @Value("${app.rate-limit.pin-max-attempts}")
    private int pinMaxAttempts;

    @Value("${app.rate-limit.pin-window-minutes}")
    private int pinWindowMinutes;

    private final Map<String, Integer> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> loginLockout = new ConcurrentHashMap<>();

    public RateLimiterService(PinAttemptRepository pinAttemptRepository) {
        this.pinAttemptRepository = pinAttemptRepository;
    }

    public void checkLoginRateLimit(String email) {
        String key = "login:" + email;
        LocalDateTime lockoutUntil = loginLockout.get(key);
        if (lockoutUntil != null && lockoutUntil.isAfter(LocalDateTime.now())) {
            throw new RateLimitExceededException(
                    "Account temporarily locked due to too many failed login attempts. Try again later.");
        }

        int attempts = loginAttempts.getOrDefault(key, 0);
        if (attempts >= loginMaxAttempts) {
            loginLockout.put(key, LocalDateTime.now().plusMinutes(loginWindowMinutes));
            loginAttempts.remove(key);
            throw new RateLimitExceededException(
                    "Account temporarily locked due to too many failed login attempts. Try again later.");
        }
    }

    public void recordFailedLogin(String email) {
        String key = "login:" + email;
        loginAttempts.merge(key, 1, Integer::sum);
    }

    public void resetLoginAttempts(String email) {
        loginAttempts.remove("login:" + email);
        loginLockout.remove("login:" + email);
    }

    public void checkPinRateLimit(User user) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(pinWindowMinutes);
        long failedAttempts = pinAttemptRepository.countByUserAndSuccessAndAttemptedAtAfter(
                user, false, windowStart);

        if (failedAttempts >= pinMaxAttempts) {
            throw new RateLimitExceededException(
                    "Too many failed PIN attempts. Please wait " + pinWindowMinutes + " minutes before trying again.");
        }
    }

    public void recordPinAttempt(User user, boolean success) {
        PinAttempt attempt = PinAttempt.builder()
                .user(user)
                .success(success)
                .build();
        pinAttemptRepository.save(attempt);
    }
}
