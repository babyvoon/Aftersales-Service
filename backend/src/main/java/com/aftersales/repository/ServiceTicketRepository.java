package com.aftersales.repository;

import com.aftersales.entity.ServiceTicket;
import com.aftersales.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link ServiceTicket} entity.
 * Default queries automatically exclude soft-deleted records.
 */
@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {

    /**
     * Find all tickets with a specific status.
     * Used to populate Kanban board columns.
     */
    List<ServiceTicket> findByStatus(TicketStatus status);

    /**
     * Find all tickets assigned to a specific mechanic.
     */
    List<ServiceTicket> findByAssignedMechanicId(Long mechanicId);

    /**
     * Find all tickets for a specific vehicle.
     */
    List<ServiceTicket> findByVehicleId(Long vehicleId);

    /**
     * Find all tickets for a specific vehicle, ordered by creation date (newest first).
     */
    List<ServiceTicket> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    /**
     * Find tickets created within a date range (for reporting).
     */
    List<ServiceTicket> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Count tickets by status (for dashboard statistics).
     */
    long countByStatus(TicketStatus status);

    /**
     * Fetch a ticket with all its items eagerly loaded (avoids N+1 for billing).
     */
    @Query("SELECT st FROM ServiceTicket st " +
           "LEFT JOIN FETCH st.ticketItems ti " +
           "LEFT JOIN FETCH ti.sparePart " +
           "LEFT JOIN FETCH st.vehicle v " +
           "LEFT JOIN FETCH v.customer " +
           "WHERE st.id = :id")
    Optional<ServiceTicket> findByIdWithDetails(@Param("id") Long id);

    /**
     * Explicitly query including soft-deleted records (for audit purposes).
     */
    @Query("SELECT st FROM ServiceTicket st WHERE st.id = :id")
    Optional<ServiceTicket> findByIdIncludingDeleted(@Param("id") Long id);
}
