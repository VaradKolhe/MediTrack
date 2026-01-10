package com.bedtracker.userservice.dto;

import lombok.Data;

@Data
public class ReceptionistRequest {
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String password;
    private Long hospitalId;
}