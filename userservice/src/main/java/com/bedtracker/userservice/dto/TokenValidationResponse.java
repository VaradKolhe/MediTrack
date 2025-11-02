package com.bedtracker.userservice.dto;

import com.bedtracker.userservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {
    
    private boolean valid;
    private String username;
    private Long userId;
    private Role role;
    private String message;
}
