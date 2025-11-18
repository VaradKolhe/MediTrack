package com.meditrack.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionistResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Long hospitalId;
    private String phoneNumber;
    private String shift;
}

