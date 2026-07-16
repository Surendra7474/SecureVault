package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateUserRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120)
    private String name;

    @Size(max = 20)
    private String phoneNumber;

    @Size(min = 4, max = 6)
    private String currentPin;

    @Size(min = 4, max = 6)
    private String newPin;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String name, String phoneNumber, String currentPin, String newPin) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.currentPin = currentPin;
        this.newPin = newPin;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCurrentPin() {
        return currentPin;
    }

    public void setCurrentPin(String currentPin) {
        this.currentPin = currentPin;
    }

    public String getNewPin() {
        return newPin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }
}
