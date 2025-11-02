package com.bedtracker.hospitalservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms", indexes = {
    @Index(name = "idx_hospital_room", columnList = "hospitalId, roomNumber", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;
    
    @Column(nullable = false)
    private Long hospitalId;
    
    @Column(nullable = false, length = 50)
    private String roomNumber;
    
    @Column(nullable = false)
    private Integer totalBeds;
    
    // Note: Rooms are created by admin-service, this entity is for reference only
    // We don't create/update rooms from hospital-service, only read them
}

