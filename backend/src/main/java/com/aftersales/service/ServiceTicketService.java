package com.aftersales.service;

import com.aftersales.dto.*;
import com.aftersales.enums.TicketStatus;

import java.util.List;

/**
 * Service interface for managing service tickets.
 * Defines the contract for ticket CRUD, status transitions,
 * line item management, and billing calculations.
 */
public interface ServiceTicketService {

    /**
     * Creates a new service ticket.
     * Validates vehicle existence and optional mechanic assignment.
     *
     * @param request the ticket creation data
     * @return the created ticket with billing breakdown
     */
    ServiceTicketResponse createTicket(CreateTicketRequest request);

    /**
     * Retrieves a ticket by ID with full details (vehicle, customer, mechanic, items).
     * Uses eager fetching to avoid N+1 queries.
     *
     * @param id the ticket ID
     * @return the ticket with complete details
     */
    ServiceTicketResponse getTicketById(Long id);

    /**
     * Retrieves all active (non-deleted) tickets.
     *
     * @return list of all tickets
     */
    List<ServiceTicketResponse> getAllTickets();

    /**
     * Retrieves all tickets with a specific status.
     * Used to populate Kanban board columns.
     *
     * @param status the ticket status to filter by
     * @return list of tickets matching the status
     */
    List<ServiceTicketResponse> getTicketsByStatus(TicketStatus status);

    /**
     * Updates a ticket's mutable fields (description, labor cost, mechanic).
     * Recalculates total cost if labor cost changes.
     *
     * @param id      the ticket ID
     * @param request the update data (null fields are skipped)
     * @return the updated ticket
     */
    ServiceTicketResponse updateTicket(Long id, UpdateTicketRequest request);

    /**
     * Transitions a ticket to a new status.
     * Validates the transition against allowed workflow rules.
     *
     * @param id      the ticket ID
     * @param request the target status
     * @return the updated ticket
     */
    ServiceTicketResponse updateTicketStatus(Long id, UpdateTicketStatusRequest request);

    /**
     * Adds a spare part line item to a ticket.
     * Validates stock availability, atomically decrements inventory,
     * and recalculates the ticket total.
     *
     * @param ticketId the ticket ID
     * @param request  the item data (part ID and quantity)
     * @return the updated ticket with new item
     */
    ServiceTicketResponse addTicketItem(Long ticketId, AddTicketItemRequest request);

    /**
     * Removes a line item from a ticket.
     * Restores the spare part stock and recalculates the ticket total.
     *
     * @param ticketId the ticket ID
     * @param itemId   the item ID to remove
     * @return the updated ticket without the removed item
     */
    ServiceTicketResponse removeTicketItem(Long ticketId, Long itemId);

    /**
     * Soft-deletes a service ticket.
     * The record is retained for auditing purposes.
     *
     * @param id the ticket ID
     */
    void deleteTicket(Long id);
}
