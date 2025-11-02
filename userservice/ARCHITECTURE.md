# User Service Architecture - Separation of Concerns Pattern

## Overview
This document outlines the new architecture pattern implemented in the User Service, following the principle of **Separation of Concerns** where the User entity is kept as a plain JPA entity, separate from Spring Security's UserDetails implementation.

## Architecture Components

### 1. **User Entity** (`entity/User.java`)
```java
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@ToString(exclude = "password")
public class User {
    // Plain JPA entity with business fields only
    // No Spring Security dependencies
    // Includes JPA lifecycle callbacks for timestamps
    // Custom constructor for creating new users
}
```

**Responsibilities:**
- Database mapping and persistence
- Business logic fields (username, email, password, role, etc.)
- JPA lifecycle management (createdAt, updatedAt)
- Data validation annotations

### 2. **CustomUserDetails** (`security/CustomUserDetails.java`)
```java
@Data @AllArgsConstructor
public class CustomUserDetails implements UserDetails {
    private User user;
    
    // Implements all UserDetails methods
    // Delegates to User entity for actual data
    // Handles Spring Security integration
}
```

**Responsibilities:**
- Spring Security integration
- UserDetails interface implementation
- Authority/role management
- Authentication state management

### 3. **UserService** (`service/UserService.java`)
```java
@Service @RequiredArgsConstructor @Slf4j
public class UserService implements UserDetailsService {
    // Converts User entities to CustomUserDetails
    // Handles user CRUD operations
    // Implements UserDetailsService for Spring Security
}
```

**Responsibilities:**
- User CRUD operations
- Converting between User entity and CustomUserDetails
- UserDetailsService implementation for Spring Security
- Business logic for user management

### 4. **AuthService** (`service/AuthService.java`)
```java
@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    // Handles authentication and authorization
    // Works with CustomUserDetails for security
    // JWT token generation and validation
}
```

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Authentication flow management
- Password encoding

## Benefits of This Architecture

### 1. **Separation of Concerns**
- **User Entity**: Pure business domain model
- **CustomUserDetails**: Security-specific wrapper
- **Services**: Business logic and security integration

### 2. **Maintainability**
- Clear boundaries between layers
- Easy to modify security implementation without affecting business model
- Single responsibility for each component

### 3. **Testability**
- User entity can be tested independently
- Security logic is isolated and testable
- Mock objects are easier to create

### 4. **Flexibility**
- Can easily change security framework without affecting User entity
- Multiple security implementations can coexist
- Business logic remains framework-agnostic

### 5. **Clean Code**
- User entity is lightweight and focused
- No framework dependencies in domain model
- Clear separation of responsibilities

## Data Flow

```
1. Client Request → Controller
2. Controller → Service Layer
3. Service Layer → Repository (User entity)
4. Service Layer → CustomUserDetails (for security)
5. CustomUserDetails → Spring Security
6. Response → Client
```

## Usage Examples

### Creating a User
```java
// Business logic creates User entity
User user = new User(username, email, password, role, firstName, lastName);
User savedUser = userRepository.save(user);
```

### Authentication
```java
// Security layer uses CustomUserDetails
UserDetails userDetails = new CustomUserDetails(user);
Authentication auth = new UsernamePasswordAuthenticationToken(
    userDetails, null, userDetails.getAuthorities());
```

### Token Generation
```java
// JWT service works with CustomUserDetails
String token = jwtUtil.generateToken(userDetails, claims);
```

## Migration Benefits

This pattern provides:
- **Backward Compatibility**: All existing functionality preserved
- **Forward Compatibility**: Easy to extend and modify
- **Clean Architecture**: Follows SOLID principles
- **Framework Independence**: Business logic separated from framework concerns

## Best Practices

1. **Keep User entity pure**: No Spring Security imports
2. **Use CustomUserDetails for security**: All security operations go through this wrapper
3. **Convert at service boundaries**: Transform between User and CustomUserDetails in services
4. **Maintain single responsibility**: Each class has one clear purpose
5. **Use Lombok wisely**: Reduce boilerplate while maintaining readability

This architecture ensures that the User entity remains a clean, business-focused domain model while still providing full Spring Security integration through the CustomUserDetails wrapper.

