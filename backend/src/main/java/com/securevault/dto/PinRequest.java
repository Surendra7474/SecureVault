package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PinRequest {

    @NotBlank(message = "PIN is required")
    @Size(min = 4, max = 6, message = "PIN must be between 4 and 6 digits")
    @Pattern(regexp = "^[0-9]+$", message = "PIN must contain only digits")
    private String pin;

    public PinRequest() {
    }

    public PinRequest(String pin) {
        this.pin = pin;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String pin;

        public Builder pin(String pin) {
            this.pin = pin;
            return this;
        }

        public PinRequest build() {
            return new PinRequest(pin);
        }
    }
}