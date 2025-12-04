package com.meditrack.adminservice.service;

import com.meditrack.adminservice.dto.*;
import com.meditrack.adminservice.entity.Hospital;
import com.meditrack.adminservice.entity.Room;
import com.meditrack.adminservice.exception.AdminServiceException;
import com.meditrack.adminservice.repository.HospitalRepository;
import com.meditrack.adminservice.repository.RoomRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    // Using Service Discovery name
    private static final String USER_SERVICE_BASE_URL = "http://userservice";

    private final RestTemplate restTemplate;
    private final HospitalRepository hospitalRepository;
    private final RoomRepository roomRepository;

    // --- Helper Methods to Propagate Token ---

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            // Extract the Authorization header (Bearer token)
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null) {
                headers.set(HttpHeaders.AUTHORIZATION, authHeader);
            }
        }
        return headers;
    }

    private <T> T exchange(String baseUrl, String path, HttpMethod method, Object body, Class<T> responseType, String serviceName) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(body, getHeaders());
            ResponseEntity<T> response = restTemplate.exchange(baseUrl + path, method, entity, responseType);
            return response.getBody();
        } catch (RestClientException ex) {
            throw new AdminServiceException("Failed to call " + serviceName + ": " + ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new AdminServiceException("Unexpected error calling " + serviceName, ex);
        }
    }

    private <T> T exchange(String baseUrl, String path, HttpMethod method, Object body, ParameterizedTypeReference<T> responseType, String serviceName) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(body, getHeaders());
            ResponseEntity<T> response = restTemplate.exchange(baseUrl + path, method, entity, responseType);
            return response.getBody();
        } catch (RestClientException ex) {
            throw new AdminServiceException("Failed to call " + serviceName + ": " + ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new AdminServiceException("Unexpected error calling " + serviceName, ex);
        }
    }

    private <T> T callUser(String path, HttpMethod method, Object body, Class<T> responseType) {
        return exchange(USER_SERVICE_BASE_URL, path, method, body, responseType, "user service");
    }

    private <T> T callUser(String path, HttpMethod method, Object body, ParameterizedTypeReference<T> responseType) {
        return exchange(USER_SERVICE_BASE_URL, path, method, body, responseType, "user service");
    }

    // --- Helper for Bed Calculation ---
    private void recalculateHospitalTotalBeds(Hospital hospital) {
        List<Room> rooms = roomRepository.findByHospital_Id(hospital.getId());
        // Sum all beds from rooms belonging to this hospital
        int totalBeds = rooms.stream().mapToInt(Room::getTotalBeds).sum();
        hospital.setTotalBeds(totalBeds);
        hospitalRepository.save(hospital);
    }

    // --- Hospitals (local JPA) ---
    public HospitalResponse createHospital(HospitalRequest request) {
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .contactNumber(request.getContactNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .totalBeds(0)
                .build();
        Hospital saved = hospitalRepository.save(hospital);
        return HospitalResponse.fromEntity(saved);
    }

    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll().stream().map(HospitalResponse::fromEntity).collect(Collectors.toList());
    }

    public HospitalResponse getHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Hospital not found: " + id));
        return HospitalResponse.fromEntity(hospital);
    }

    public HospitalResponse updateHospital(Long id, HospitalRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Hospital not found: " + id));
        hospital.setName(request.getName());
        hospital.setContactNumber(request.getContactNumber());
        hospital.setAddress(request.getAddress());
        hospital.setCity(request.getCity());
        hospital.setState(request.getState());
        hospital.setTotalBeds(hospital.getTotalBeds());
        Hospital saved = hospitalRepository.save(hospital);
        return HospitalResponse.fromEntity(saved);
    }

    public void deleteHospital(Long id) {
        if (!hospitalRepository.existsById(id)) {
            throw new AdminServiceException("Hospital not found: " + id);
        }
        hospitalRepository.deleteById(id);
    }

    // --- Rooms (local JPA) ---

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new AdminServiceException("Hospital not found: " + request.getHospitalId()));

        Room room = Room.builder()
                .hospital(hospital)
                .roomNumber(request.getRoomNumber())
                .totalBeds(request.getTotalBeds())
                .build();

        Room saved = roomRepository.save(room);

        // Recalculate hospital beds in real-time
        recalculateHospitalTotalBeds(hospital);

        return RoomResponse.fromEntity(saved, 0);
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(room -> RoomResponse.fromEntity(room, 0))
                .collect(Collectors.toList());
    }

    // NEW: View rooms inside a particular hospital
    public List<RoomResponse> getRoomsByHospital(Long hospitalId) {
        if (!hospitalRepository.existsById(hospitalId)) {
            throw new AdminServiceException("Hospital not found with id: " + hospitalId);
        }
        // Using the custom repository method you mentioned
        List<Room> rooms = roomRepository.findByHospital_Id(hospitalId);
        return rooms.stream()
                .map(room -> RoomResponse.fromEntity(room, 0))
                .collect(Collectors.toList());
    }

    public RoomResponse getRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Room not found: " + id));
        return RoomResponse.fromEntity(room, 0);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Room not found: " + id));

        Hospital oldHospital = room.getHospital();
        Hospital newHospital = null;

        // Check if hospital is changing
        if (request.getHospitalId() != null && !request.getHospitalId().equals(oldHospital.getId())) {
            newHospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new AdminServiceException("Hospital not found: " + request.getHospitalId()));
            room.setHospital(newHospital);
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setTotalBeds(request.getTotalBeds());

        Room saved = roomRepository.save(room);

        // Recalculate beds for old hospital
        recalculateHospitalTotalBeds(oldHospital);

        // If hospital changed, recalculate new hospital too
        if (newHospital != null) {
            recalculateHospitalTotalBeds(newHospital);
        } else {
            // If hospital didn't change (it's the same object as oldHospital),
            // the first recalculate call above already handled the updated counts.
        }

        return RoomResponse.fromEntity(saved, 0);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AdminServiceException("Room not found: " + id));

        Hospital hospital = room.getHospital();

        roomRepository.deleteById(id);

        // Update hospital count after deletion
        recalculateHospitalTotalBeds(hospital);
    }

    // --- Users (External Calls) ---
    public UserResponse createUser(UserRequest request) {
        return callUser("/api/auth/register", HttpMethod.POST, request, UserResponse.class);
    }

    public List<UserResponse> getAllUsers() {
        List<UserResponse> users = callUser("/api/users", HttpMethod.GET, null, new ParameterizedTypeReference<List<UserResponse>>() {});
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

    // --- Receptionists (External Calls) ---
    public ReceptionistResponse createReceptionist(ReceptionistRequest request) {
        return callUser("/api/users/receptionists", HttpMethod.POST, request, ReceptionistResponse.class);
    }

    public List<ReceptionistResponse> getAllReceptionists() {
        List<ReceptionistResponse> receptionists = callUser("/api/users/receptionists", HttpMethod.GET, null, new ParameterizedTypeReference<List<ReceptionistResponse>>() {});
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