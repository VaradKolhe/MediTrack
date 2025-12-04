package com.bedtracker.userservice.dto;

import lombok.Data;

@Data
public class VerifyRequest {
    private String email;
    private String verificationCode;
}