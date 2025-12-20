package com.meditrack.adminservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
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

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonBackReference
    private Room room;

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

    @PrePersist
    protected void onCreate() {
        if (entryDate == null) {
            entryDate = LocalDate.now();
        }
        if (status == null) {
            status = PatientStatus.ADMITTED;
        }
    }

    public enum PatientStatus {
        ADMITTED,
        DISCHARGED
    }
}

