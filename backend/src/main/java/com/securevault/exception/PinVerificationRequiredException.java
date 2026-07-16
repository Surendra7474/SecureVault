package com.securevault.exception;

public class PinVerificationRequiredException extends RuntimeException {
    public PinVerificationRequiredException(String message) {
        super(message);
    }
}
