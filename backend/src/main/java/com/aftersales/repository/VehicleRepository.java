package com.aftersales.repository;

import com.aftersales.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Vehicle} entity.
 * Default queries automatically exclude soft-deleted records.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Find all vehicles belonging to a specific customer.
     */
    List<Vehicle> findByCustomerId(Long customerId);

    /**
     * Find a vehicle by its license plate.
     */
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    /**
     * Find a vehicle by its VIN number.
     */
    Optional<Vehicle> findByVinNumber(String vinNumber);

    /**
     * Check if a license plate already exists.
     */
    boolean existsByLicensePlate(String licensePlate);

    /**
     * Check if a VIN number already exists.
     */
    boolean existsByVinNumber(String vinNumber);

    /**
     * Find vehicles by brand (case-insensitive).
     */
    List<Vehicle> findByBrandIgnoreCase(String brand);

    /**
     * Explicitly query including soft-deleted records (for audit purposes).
     */
    @Query("SELECT v FROM Vehicle v WHERE v.id = :id")
    Optional<Vehicle> findByIdIncludingDeleted(@Param("id") Long id);
}
