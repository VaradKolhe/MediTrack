package com.bedtracker.userservice.dto;

import com.bedtracker.userservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionistResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Boolean isEnabled;
    private Long hospitalId; // Added
    private LocalDateTime createdAt;
}