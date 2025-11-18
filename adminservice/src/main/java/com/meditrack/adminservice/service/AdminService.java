package com.meditrack.adminservice.service;

import com.meditrack.adminservice.dto.HospitalRequest;
import com.meditrack.adminservice.dto.HospitalResponse;
import com.meditrack.adminservice.dto.ReceptionistRequest;
import com.meditrack.adminservice.dto.ReceptionistResponse;
import com.meditrack.adminservice.dto.RoomRequest;
import com.meditrack.adminservice.dto.RoomResponse;
import com.meditrack.adminservice.dto.UserRequest;
import com.meditrack.adminservice.dto.UserResponse;
import com.meditrack.adminservice.entity.Hospital;
import com.meditrack.adminservice.entity.Room;
import com.meditrack.adminservice.exception.AdminServiceException;
import com.meditrack.adminservice.repository.HospitalRepository;
import com.meditrack.adminservice.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final String USER_SERVICE_BASE_URL = "http://localhost:8081";

    private final RestTemplate restTemplate;

    private final HospitalRepository hospitalRepository;
    private final RoomRepository roomRepository;

    private <T> T exchange(
        String baseUrl,
        String path,
        HttpMethod method,
        Object body,
        Class<T> responseType,
        String serviceName
    ) {
        try {
            HttpEntity<?> entity = body == null ? HttpEntity.EMPTY : new HttpEntity<>(body);
            ResponseEntity<T> response = restTemplate.exchange(baseUrl + path, method, entity, responseType);
            return response.getBody();
        } catch (RestClientException ex) {
            throw new AdminServiceException("Failed to call " + serviceName, ex);
        }
    }

    private <T> T exchange(
        String baseUrl,
        String path,
        HttpMethod method,
        Object body,
        ParameterizedTypeReference<T> responseType,
        String serviceName
    ) {
        try {
            HttpEntity<?> entity = body == null ? HttpEntity.EMPTY : new HttpEntity<>(body);
            ResponseEntity<T> response = restTemplate.exchange(baseUrl + path, method, entity, responseType);
            return response.getBody();
        } catch (RestClientException ex) {
            throw new AdminServiceException("Failed to call " + serviceName, ex);
        }
    }

    private <T> T callUser(String path, HttpMethod method, Object body, Class<T> responseType) {
        return exchange(USER_SERVICE_BASE_URL, path, method, body, responseType, "user service");
    }

    private <T> T callUser(String path, HttpMethod method, Object body, ParameterizedTypeReference<T> responseType) {
        return exchange(USER_SERVICE_BASE_URL, path, method, body, responseType, "user service");
    }

    // --- Hospitals (local JPA) ---
    public HospitalResponse createHospital(HospitalRequest request) {
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .phoneNumber(request.getPhoneNumber())
                .totalBeds(request.getTotalBeds())
                .build();
        Hospital saved = hospitalRepository.save(hospital);
        return toHospitalResponse(saved);
    }

    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(this::toHospitalResponse)
                .collect(Collectors.toList());
    }

    public HospitalResponse getHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Hospital not found: " + id));
        return toHospitalResponse(hospital);
    }

    public HospitalResponse updateHospital(Long id, HospitalRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Hospital not found: " + id));
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setCity(request.getCity());
        hospital.setState(request.getState());
        hospital.setPhoneNumber(request.getPhoneNumber());
        hospital.setTotalBeds(request.getTotalBeds());
        Hospital saved = hospitalRepository.save(hospital);
        return toHospitalResponse(saved);
    }

    public void deleteHospital(Long id) {
        hospitalRepository.deleteById(id);
    }

    private HospitalResponse toHospitalResponse(Hospital hospital) {
        return new HospitalResponse(
                hospital.getId(),
                hospital.getName(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getState(),
                hospital.getPhoneNumber(),
                hospital.getTotalBeds(),
                0,
                OffsetDateTime.of(hospital.getCreatedAt(), OffsetDateTime.now().getOffset()),
                OffsetDateTime.of(hospital.getUpdatedAt(), OffsetDateTime.now().getOffset())
        );
    }

    // --- Rooms (local JPA) ---
    public RoomResponse createRoom(RoomRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new AdminServiceException("Hospital not found: " + request.getHospitalId()));
        Room room = Room.builder()
                .hospital(hospital)
                .roomNumber(request.getRoomNumber())
                .ward(request.getWard())
                .totalBeds(request.getTotalBeds())
                .build();
        Room saved = roomRepository.save(room);
        return toRoomResponse(saved);
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toRoomResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Room not found: " + id));
        return toRoomResponse(room);
    }

    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Room not found: " + id));
        if (request.getHospitalId() != null) {
            Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new AdminServiceException("Hospital not found: " + request.getHospitalId()));
            room.setHospital(hospital);
        }
        room.setRoomNumber(request.getRoomNumber());
        room.setWard(request.getWard());
        room.setTotalBeds(request.getTotalBeds());
        Room saved = roomRepository.save(room);
        return toRoomResponse(saved);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    private RoomResponse toRoomResponse(Room room) {
        RoomResponse r = new RoomResponse();
        r.setId(room.getId());
        r.setRoomNumber(room.getRoomNumber());
        r.setWard(room.getWard());
        r.setTotalBeds(room.getTotalBeds());
        r.setOccupiedBeds(0);
        r.setStatus("ACTIVE");
        return r;
    }


    // --- Users (kept as external calls) ---
    public UserResponse createUser(UserRequest request) {
        return callUser("/api/auth/register", HttpMethod.POST, request, UserResponse.class);
    }

    public List<UserResponse> getAllUsers() {
        List<UserResponse> users = callUser(
            "/api/users",
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<UserResponse>>() {}
        );
        return users != null ? users : List.of();
    }

    public UserResponse getUser(Long id) {
        return callUser("/api/users/" + id, HttpMethod.GET, null, UserResponse.class);
    }

    public UserResponse updateUser(Long id, UserRequest request) {
        return callUser("/api/users/" + id, HttpMethod.PUT, request, UserResponse.class);
    }

    public void deleteUser(Long id) {
        callUser("/api/users/" + id, HttpMethod.DELETE, null, Void.class);
    }

    // --- Receptionists (kept as external calls) ---
    public ReceptionistResponse createReceptionist(ReceptionistRequest request) {
        return callUser("/api/users/receptionists", HttpMethod.POST, request, ReceptionistResponse.class);
    }

    public List<ReceptionistResponse> getAllReceptionists() {
        List<ReceptionistResponse> receptionists = callUser(
            "/api/users/receptionists",
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ReceptionistResponse>>() {}
        );
        return receptionists != null ? receptionists : List.of();
    }

    public ReceptionistResponse getReceptionist(Long id) {
        return callUser("/api/users/receptionists/" + id, HttpMethod.GET, null, ReceptionistResponse.class);
    }

    public ReceptionistResponse updateReceptionist(Long id, ReceptionistRequest request) {
        return callUser("/api/users/receptionists/" + id, HttpMethod.PUT, request, ReceptionistResponse.class);
    }

    public void deleteReceptionist(Long id) {
        callUser("/api/users/receptionists/" + id, HttpMethod.DELETE, null, Void.class);
    }
}
