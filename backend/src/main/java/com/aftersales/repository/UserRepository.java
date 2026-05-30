package com.aftersales.repository;

import com.aftersales.entity.User;
import com.aftersales.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link User} entity.
 * Provides methods for authentication lookups and role-based queries.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their unique username.
     * Used primarily during authentication.
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if a username already exists in the system.
     */
    boolean existsByUsername(String username);

    /**
     * Find all users with a specific role.
     * Useful for listing available mechanics for ticket assignment.
     */
    List<User> findByRole(UserRole role);
}
