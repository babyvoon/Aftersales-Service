package com.aftersales.repository;

import com.aftersales.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link SparePart} entity.
 * Provides inventory lookup and stock management queries.
 */
@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {

    /**
     * Find a spare part by its unique part number.
     */
    Optional<SparePart> findByPartNumber(String partNumber);

    /**
     * Search spare parts by name (case-insensitive partial match).
     */
    List<SparePart> findByNameContainingIgnoreCase(String name);

    /**
     * Find all parts that are low in stock (below a threshold).
     */
    List<SparePart> findByStockQuantityLessThan(Integer threshold);

    /**
     * Find all parts that are currently out of stock.
     */
    List<SparePart> findByStockQuantity(Integer quantity);

    /**
     * Check if a part number already exists.
     */
    boolean existsByPartNumber(String partNumber);

    /**
     * Atomically decrement stock quantity when parts are used.
     * Returns the number of rows updated (0 if insufficient stock).
     */
    @Modifying
    @Query("UPDATE SparePart sp SET sp.stockQuantity = sp.stockQuantity - :qty " +
           "WHERE sp.id = :partId AND sp.stockQuantity >= :qty")
    int decrementStock(@Param("partId") Long partId, @Param("qty") Integer qty);
}
