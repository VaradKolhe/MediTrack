package com.meditrack.adminservice.service;

import com.meditrack.adminservice.dto.*;
import com.meditrack.adminservice.entity.Hospital;
import com.meditrack.adminservice.entity.Room;
import com.meditrack.adminservice.exception.*;
import com.meditrack.adminservice.repository.HospitalRepository;
import com.meditrack.adminservice.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);
    
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
            HttpEntity<?> entity = body != null ? new HttpEntity<>(body, getHeaders()) : new HttpEntity<>(getHeaders());
            ResponseEntity<T> response = restTemplate.exchange(baseUrl + path, method, entity, responseType);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                log.warn("Unexpected response from {}: status={}", serviceName, response.getStatusCode());
                throw new ExternalServiceException(serviceName, "Unexpected response status: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException ex) {
            log.error("HTTP client error calling {}: status={}, body={}", serviceName, ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ExternalServiceException(serviceName, ex.getResponseBodyAsString(), ex.getStatusCode().value());
        } catch (org.springframework.web.client.HttpServerErrorException ex) {
            log.error("HTTP server error calling {}: status={}, body={}", serviceName, ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ExternalServiceException(serviceName, "Service unavailable: " + ex.getResponseBodyAsString(), ex.getStatusCode().value());
        } catch (RestClientException ex) {
            log.error("Rest client error calling {}: {}", serviceName, ex.getMessage(), ex);
            throw new ExternalServiceException(serviceName, "Failed to connect to service: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Unexpected error calling {}: {}", serviceName, ex.getMessage(), ex);
            throw new AdminServiceException("Unexpected error calling " + serviceName, ex);
        }
    }

    private <T> T exchange(String baseUrl, String path, HttpMethod method, Object body, ParameterizedTypeReference<T> responseType, String serviceName) {
        try {
            HttpEntity<?> entity = body != null ? new HttpEntity<>(body, getHeaders()) : new HttpEntity<>(getHeaders());
            ResponseEntity<T> response = restTemplate.exchange(baseUrl + path, method, entity, responseType);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                log.warn("Unexpected response from {}: status={}", serviceName, response.getStatusCode());
                throw new ExternalServiceException(serviceName, "Unexpected response status: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException ex) {
            log.error("HTTP client error calling {}: status={}, body={}", serviceName, ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ExternalServiceException(serviceName, ex.getResponseBodyAsString(), ex.getStatusCode().value());
        } catch (org.springframework.web.client.HttpServerErrorException ex) {
            log.error("HTTP server error calling {}: status={}, body={}", serviceName, ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ExternalServiceException(serviceName, "Service unavailable: " + ex.getResponseBodyAsString(), ex.getStatusCode().value());
        } catch (RestClientException ex) {
            log.error("Rest client error calling {}: {}", serviceName, ex.getMessage(), ex);
            throw new ExternalServiceException(serviceName, "Failed to connect to service: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("Unexpected error calling {}: {}", serviceName, ex.getMessage(), ex);
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
        try {
            if (hospital == null || hospital.getId() == null) {
                log.warn("Attempted to recalculate beds for null hospital or hospital without ID");
                return;
            }
            List<Room> rooms = roomRepository.findByHospital_Id(hospital.getId());
            // Sum all beds from rooms belonging to this hospital
            int totalBeds = rooms.stream()
                .mapToInt(room -> room.getTotalBeds() != null ? room.getTotalBeds() : 0)
                .sum();
            hospital.setTotalBeds(totalBeds);
            hospitalRepository.save(hospital);
            log.debug("Recalculated total beds for hospital {}: {}", hospital.getId(), totalBeds);
        } catch (Exception ex) {
            log.error("Error recalculating beds for hospital {}: {}", hospital != null ? hospital.getId() : "null", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to recalculate hospital beds", ex);
        }
    }

    // --- Hospitals (local JPA) ---
    @Transactional
    public HospitalResponse createHospital(HospitalRequest request) {
        try {
            log.info("Creating hospital: {}", request.getName());
            
            if (request == null) {
                throw new ValidationException("Hospital request cannot be null");
            }
            
            Hospital hospital = Hospital.builder()
                    .name(request.getName())
                    .contactNumber(request.getContactNumber())
                    .address(request.getAddress())
                    .city(request.getCity())
                    .state(request.getState())
                    .totalBeds(0)
                    .build();
            
            Hospital saved = hospitalRepository.save(hospital);
            log.info("Hospital created successfully with ID: {}", saved.getId());
            return HospitalResponse.fromEntity(saved);
        } catch (Exception ex) {
            log.error("Error creating hospital: {}", ex.getMessage(), ex);
            if (ex instanceof ValidationException || ex instanceof ResourceNotFoundException) {
                throw ex;
            }
            throw new AdminServiceException("Failed to create hospital: " + ex.getMessage(), ex);
        }
    }

    public List<HospitalResponse> getAllHospitals() {
        try {
            log.debug("Fetching all hospitals");
            return hospitalRepository.findAll().stream()
                    .map(HospitalResponse::fromEntity)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Error fetching all hospitals: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch hospitals", ex);
        }
    }

    public HospitalResponse getHospital(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("Hospital ID cannot be null");
            }
            log.debug("Fetching hospital with ID: {}", id);
            Hospital hospital = hospitalRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital", id));
            return HospitalResponse.fromEntity(hospital);
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching hospital {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch hospital", ex);
        }
    }

    @Transactional
    public HospitalResponse updateHospital(Long id, HospitalRequest request) {
        try {
            if (id == null) {
                throw new ValidationException("Hospital ID cannot be null");
            }
            if (request == null) {
                throw new ValidationException("Hospital request cannot be null");
            }
            
            log.info("Updating hospital with ID: {}", id);
            Hospital hospital = hospitalRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital", id));
            
            hospital.setName(request.getName());
            hospital.setContactNumber(request.getContactNumber());
            hospital.setAddress(request.getAddress());
            hospital.setCity(request.getCity());
            hospital.setState(request.getState());
            // Keep existing totalBeds as it's calculated from rooms
            
            Hospital saved = hospitalRepository.save(hospital);
            log.info("Hospital updated successfully with ID: {}", saved.getId());
            return HospitalResponse.fromEntity(saved);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error updating hospital {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to update hospital", ex);
        }
    }

    @Transactional
    public void deleteHospital(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("Hospital ID cannot be null");
            }
            
            log.info("Deleting hospital with ID: {}", id);
            if (!hospitalRepository.existsById(id)) {
                throw new ResourceNotFoundException("Hospital", id);
            }
            
            // Check if hospital has rooms
            List<Room> rooms = roomRepository.findByHospital_Id(id);
            if (!rooms.isEmpty()) {
                throw new ValidationException("Cannot delete hospital with ID " + id + " because it has " + rooms.size() + " room(s). Please delete rooms first.");
            }
            
            hospitalRepository.deleteById(id);
            log.info("Hospital deleted successfully with ID: {}", id);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error deleting hospital {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to delete hospital", ex);
        }
    }

    // --- Rooms (local JPA) ---

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        try {
            if (request == null) {
                throw new ValidationException("Room request cannot be null");
            }
            if (request.getHospitalId() == null) {
                throw new ValidationException("Hospital ID cannot be null");
            }
            if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
                throw new ValidationException("Room number cannot be null or empty");
            }
            if (request.getTotalBeds() == null || request.getTotalBeds() <= 0) {
                throw new ValidationException("Total beds must be greater than 0");
            }
            
            log.info("Creating room: {} for hospital: {}", request.getRoomNumber(), request.getHospitalId());
            
            Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital", request.getHospitalId()));

            Room room = Room.builder()
                    .hospital(hospital)
                    .roomNumber(request.getRoomNumber().trim())
                    .totalBeds(request.getTotalBeds())
                    .build();

            Room saved = roomRepository.save(room);
            
            // Recalculate hospital beds in real-time
            recalculateHospitalTotalBeds(hospital);
            
            log.info("Room created successfully with ID: {}", saved.getId());
            return RoomResponse.fromEntity(saved, 0);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error creating room: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to create room: " + ex.getMessage(), ex);
        }
    }

    public List<RoomResponse> getAllRooms() {
        try {
            log.debug("Fetching all rooms");
            return roomRepository.findAll().stream()
                    .map(room -> RoomResponse.fromEntity(room, 0))
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Error fetching all rooms: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch rooms", ex);
        }
    }

    // NEW: View rooms inside a particular hospital
    public List<RoomResponse> getRoomsByHospital(Long hospitalId) {
        try {
            if (hospitalId == null) {
                throw new ValidationException("Hospital ID cannot be null");
            }
            
            log.debug("Fetching rooms for hospital: {}", hospitalId);
            if (!hospitalRepository.existsById(hospitalId)) {
                throw new ResourceNotFoundException("Hospital", hospitalId);
            }
            
            List<Room> rooms = roomRepository.findByHospital_Id(hospitalId);
            return rooms.stream()
                    .map(room -> RoomResponse.fromEntity(room, 0))
                    .collect(Collectors.toList());
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching rooms for hospital {}: {}", hospitalId, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch rooms for hospital", ex);
        }
    }

    public RoomResponse getRoom(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("Room ID cannot be null");
            }
            
            log.debug("Fetching room with ID: {}", id);
            Room room = roomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Room", id));
            return RoomResponse.fromEntity(room, 0);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching room {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch room", ex);
        }
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        try {
            if (id == null) {
                throw new ValidationException("Room ID cannot be null");
            }
            if (request == null) {
                throw new ValidationException("Room request cannot be null");
            }
            if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
                throw new ValidationException("Room number cannot be null or empty");
            }
            if (request.getTotalBeds() == null || request.getTotalBeds() <= 0) {
                throw new ValidationException("Total beds must be greater than 0");
            }
            
            log.info("Updating room with ID: {}", id);
            Room room = roomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Room", id));

            Hospital oldHospital = room.getHospital();
            Hospital newHospital = null;

            // Check if hospital is changing
            if (request.getHospitalId() != null && !request.getHospitalId().equals(oldHospital.getId())) {
                newHospital = hospitalRepository.findById(request.getHospitalId())
                        .orElseThrow(() -> new ResourceNotFoundException("Hospital", request.getHospitalId()));
                room.setHospital(newHospital);
            }

            room.setRoomNumber(request.getRoomNumber().trim());
            room.setTotalBeds(request.getTotalBeds());

            Room saved = roomRepository.save(room);

            // Recalculate beds for old hospital
            recalculateHospitalTotalBeds(oldHospital);

            // If hospital changed, recalculate new hospital too
            if (newHospital != null) {
                recalculateHospitalTotalBeds(newHospital);
            }

            log.info("Room updated successfully with ID: {}", saved.getId());
            return RoomResponse.fromEntity(saved, 0);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error updating room {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to update room", ex);
        }
    }

    @Transactional
    public void deleteRoom(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("Room ID cannot be null");
            }
            
            log.info("Deleting room with ID: {}", id);
            Room room = roomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Room", id));

            Hospital hospital = room.getHospital();

            roomRepository.deleteById(id);

            // Update hospital count after deletion
            recalculateHospitalTotalBeds(hospital);
            
            log.info("Room deleted successfully with ID: {}", id);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error deleting room {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to delete room", ex);
        }
    }

    // --- Users (External Calls) ---
    public UserResponse createUser(UserRequest request) {
        try {
            if (request == null) {
                throw new ValidationException("User request cannot be null");
            }
            log.info("Creating user: {}", request.getUsername());
            return callUser("/api/auth/register", HttpMethod.POST, request, UserResponse.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error creating user: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to create user", ex);
        }
    }

    public List<UserResponse> getAllUsers() {
        try {
            log.debug("Fetching all users");
            List<UserResponse> users = callUser("/api/users", HttpMethod.GET, null, 
                new ParameterizedTypeReference<List<UserResponse>>() {});
            return users != null ? users : List.of();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching all users: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch users", ex);
        }
    }

    public UserResponse getUser(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("User ID cannot be null");
            }
            log.debug("Fetching user with ID: {}", id);
            return callUser("/api/users/" + id, HttpMethod.GET, null, UserResponse.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching user {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch user", ex);
        }
    }

    public UserResponse updateUser(Long id, UserRequest request) {
        try {
            if (id == null) {
                throw new ValidationException("User ID cannot be null");
            }
            if (request == null) {
                throw new ValidationException("User request cannot be null");
            }
            log.info("Updating user with ID: {}", id);
            return callUser("/api/users/" + id, HttpMethod.PUT, request, UserResponse.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error updating user {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to update user", ex);
        }
    }

    public void deleteUser(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("User ID cannot be null");
            }
            log.info("Deleting user with ID: {}", id);
            callUser("/api/users/" + id, HttpMethod.DELETE, null, Void.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error deleting user {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to delete user", ex);
        }
    }

    // --- Receptionists (External Calls) ---
    public ReceptionistResponse createReceptionist(ReceptionistRequest request) {
        try {
            if (request == null) {
                throw new ValidationException("Receptionist request cannot be null");
            }
            log.info("Creating receptionist: {}", request.getUsername());
            return callUser("/api/users/receptionists", HttpMethod.POST, request, ReceptionistResponse.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error creating receptionist: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to create receptionist", ex);
        }
    }

    public List<ReceptionistResponse> getAllReceptionists() {
        try {
            log.debug("Fetching all receptionists");
            List<ReceptionistResponse> receptionists = callUser("/api/users/receptionists", HttpMethod.GET, null, 
                new ParameterizedTypeReference<List<ReceptionistResponse>>() {});
            return receptionists != null ? receptionists : List.of();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching all receptionists: {}", ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch receptionists", ex);
        }
    }

    public ReceptionistResponse getReceptionist(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("Receptionist ID cannot be null");
            }
            log.debug("Fetching receptionist with ID: {}", id);
            return callUser("/api/users/receptionists/" + id, HttpMethod.GET, null, ReceptionistResponse.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error fetching receptionist {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to fetch receptionist", ex);
        }
    }

    public ReceptionistResponse updateReceptionist(Long id, ReceptionistRequest request) {
        try {
            if (id == null) {
                throw new ValidationException("Receptionist ID cannot be null");
            }
            if (request == null) {
                throw new ValidationException("Receptionist request cannot be null");
            }
            log.info("Updating receptionist with ID: {}", id);
            return callUser("/api/users/receptionists/" + id, HttpMethod.PUT, request, ReceptionistResponse.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error updating receptionist {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to update receptionist", ex);
        }
    }

    public void deleteReceptionist(Long id) {
        try {
            if (id == null) {
                throw new ValidationException("Receptionist ID cannot be null");
            }
            log.info("Deleting receptionist with ID: {}", id);
            callUser("/api/users/receptionists/" + id, HttpMethod.DELETE, null, Void.class);
        } catch (ExternalServiceException | ValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error deleting receptionist {}: {}", id, ex.getMessage(), ex);
            throw new AdminServiceException("Failed to delete receptionist", ex);
        }
    }
}