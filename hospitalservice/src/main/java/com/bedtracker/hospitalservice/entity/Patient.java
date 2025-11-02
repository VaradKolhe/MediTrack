package com.bedtracker.hospitalservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_hospital_id", columnList = "hospitalId"),
    @Index(name = "idx_room_id", columnList = "roomId"),
    @Index(name = "idx_contact_number", columnList = "contactNumber"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;
    
    @Column(nullable = false)
    private Long hospitalId;
    
    @Column(nullable = true)
    private Long roomId;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    private Integer age;
    
    @Column(nullable = false, length = 20)
    private String gender;
    
    @Column(nullable = false, length = 20, unique = false)
    private String contactNumber;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 1000)
    private String symptoms;
    
    @Column(nullable = false)
    private LocalDate entryDate;
    
    @Column
    private LocalDate exitDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PatientStatus status;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (entryDate == null) {
            entryDate = LocalDate.now();
        }
        if (status == null) {
            status = PatientStatus.ADMITTED;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PatientStatus {
        ADMITTED,
        DISCHARGED
    }
}

