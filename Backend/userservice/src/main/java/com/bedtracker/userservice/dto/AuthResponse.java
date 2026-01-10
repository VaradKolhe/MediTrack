package com.bedtracker.userservice.dto;

import com.bedtracker.userservice.entity.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    
    // Custom constructor for authentication responses
    public AuthResponse(String token, Long id, String username, String email, String firstName, String lastName, Role role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }
}
