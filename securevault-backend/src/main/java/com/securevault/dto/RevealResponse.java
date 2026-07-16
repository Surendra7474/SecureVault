package com.securevault.dto;

public class RevealResponse {

    private Long id;
    private String plaintextPassword;
    private String username;

    public RevealResponse() {
    }

    public RevealResponse(Long id, String plaintextPassword, String username) {
        this.id = id;
        this.plaintextPassword = plaintextPassword;
        this.username = username;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlaintextPassword() { return plaintextPassword; }
    public void setPlaintextPassword(String plaintextPassword) { this.plaintextPassword = plaintextPassword; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String plaintextPassword;
        private String username;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder plaintextPassword(String plaintextPassword) { this.plaintextPassword = plaintextPassword; return this; }
        public Builder username(String username) { this.username = username; return this; }

        public RevealResponse build() { return new RevealResponse(id, plaintextPassword, username); }
    }
}
