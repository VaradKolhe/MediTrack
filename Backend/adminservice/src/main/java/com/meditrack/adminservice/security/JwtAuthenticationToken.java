package com.meditrack.adminservice.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {
    private final String principal;
    private final String role;

    public JwtAuthenticationToken(String principal, String role) {
        super(buildAuthorities(role));
        this.principal = principal;
        this.role = role;
        setAuthenticated(true);
    }

    private static Collection<? extends GrantedAuthority> buildAuthorities(String role) {
        if (role == null) return List.of();
        String springRole = role.toUpperCase().startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
        return List.of(new SimpleGrantedAuthority(springRole));
    }

    @Override
    public Object getCredentials() { return null; }

    @Override
    public Object getPrincipal() { return principal; }

    public String getRole() { return role; }
}


