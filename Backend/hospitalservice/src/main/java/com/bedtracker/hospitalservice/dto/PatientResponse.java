package com.bedtracker.hospitalservice.dto;

import com.bedtracker.hospitalservice.entity.Patient;
import com.bedtracker.hospitalservice.entity.Room;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    
    private Long patientId;
    private Long hospitalId;

    @JsonIgnoreProperties({"patients", "hospital"})
    private Room room;
    private String name;
    private Integer age;
    private String gender;
    private String contactNumber;
    private String address;
    private String symptoms;
    private LocalDate entryDate;
    private LocalDate exitDate;
    private String status;
    
    public static PatientResponse fromEntity(Patient patient) {
        return new PatientResponse(
            patient.getPatientId(),
            patient.getHospitalId(),
            patient.getRoom(),
            patient.getName(),
            patient.getAge(),
            patient.getGender(),
            patient.getContactNumber(),
            patient.getAddress(),
            patient.getSymptoms(),
            patient.getEntryDate(),
            patient.getExitDate(),
            patient.getStatus() != null ? patient.getStatus().name() : null
        );
    }
}

