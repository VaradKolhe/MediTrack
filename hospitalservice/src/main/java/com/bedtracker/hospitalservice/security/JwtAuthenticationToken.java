package com.bedtracker.hospitalservice.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final String username;
    private final String role;
    private final Long hospitalId;
    private final Long receptionistId;
    private final Long userId;

    public JwtAuthenticationToken(String username, String role, Long hospitalId, Long receptionistId) {
        this(username, role, hospitalId, receptionistId, null);
    }

    public JwtAuthenticationToken(String username, String role, Long hospitalId, Long receptionistId, Long userId) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
        this.username = username;
        this.role = role;
        this.hospitalId = hospitalId;
        this.receptionistId = receptionistId;
        this.userId = userId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return hospitalId;
    }

    @Override
    public Object getPrincipal() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public Long getReceptionistId() {
        return receptionistId;
    }

    public Long getUserId() {
        return userId;
    }
}

