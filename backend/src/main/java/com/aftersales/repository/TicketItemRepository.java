package com.aftersales.repository;

import com.aftersales.entity.TicketItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository for {@link TicketItem} entity.
 * Provides queries for ticket line items and billing calculations.
 */
@Repository
public interface TicketItemRepository extends JpaRepository<TicketItem, Long> {

    /**
     * Find all items belonging to a specific ticket.
     */
    List<TicketItem> findByServiceTicketId(Long ticketId);

    /**
     * Calculate the sum of all item subtotals for a given ticket.
     * Used in billing calculations.
     */
    @Query("SELECT COALESCE(SUM(ti.subtotal), 0) FROM TicketItem ti " +
           "WHERE ti.serviceTicket.id = :ticketId")
    BigDecimal calculatePartsTotal(@Param("ticketId") Long ticketId);

    /**
     * Delete all items for a specific ticket.
     */
    void deleteByServiceTicketId(Long ticketId);
}
