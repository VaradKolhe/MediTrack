package com.bedtracker.userservice.repository;

import com.bedtracker.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByUsernameAndIsEnabled(String username, Boolean isEnabled);
    
    Optional<User> findByEmailAndIsEnabled(String email, Boolean isEnabled);
}
