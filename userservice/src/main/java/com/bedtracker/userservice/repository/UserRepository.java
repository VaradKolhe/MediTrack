package com.bedtracker.userservice.repository;

import com.bedtracker.userservice.entity.Role;
import com.bedtracker.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndRole(Long id, Role role);

    List<User> findByRole(Role role);
}
