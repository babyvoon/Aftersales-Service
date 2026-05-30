package com.aftersales.repository;

import com.aftersales.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Customer} entity.
 * Default queries automatically exclude soft-deleted records
 * via the @SQLRestriction annotation on the entity.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Search customers by name (case-insensitive partial match).
     */
    List<Customer> findByFullNameContainingIgnoreCase(String name);

    /**
     * Find a customer by their phone number.
     */
    Optional<Customer> findByPhoneNumber(String phoneNumber);

    /**
     * Find a customer by their email address.
     */
    Optional<Customer> findByEmail(String email);

    /**
     * Check if an email already exists (for validation).
     */
    boolean existsByEmail(String email);

    /**
     * Explicitly query including soft-deleted records (for audit purposes).
     */
    @Query("SELECT c FROM Customer c WHERE c.id = :id")
    Optional<Customer> findByIdIncludingDeleted(@Param("id") Long id);
}
