package com.aftersales.controller;

import com.aftersales.dto.*;
import com.aftersales.enums.TicketStatus;
import com.aftersales.service.ServiceTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing service tickets.
 * Base path: /api/tickets (server context-path is /api).
 *
 * Endpoint access (to be enforced by Spring Security in Phase 3):
 *   - POST   /tickets             -> ADMIN, SERVICE_ADVISOR
 *   - GET    /tickets             -> ALL authenticated
 *   - GET    /tickets/{id}        -> ALL authenticated
 *   - PUT    /tickets/{id}        -> ADMIN, SERVICE_ADVISOR
 *   - PATCH  /tickets/{id}/status -> ADMIN, SERVICE_ADVISOR, MECHANIC
 *   - POST   /tickets/{id}/items  -> ADMIN, SERVICE_ADVISOR
 *   - DELETE /tickets/{id}/items/{itemId} -> ADMIN, SERVICE_ADVISOR
 *   - DELETE /tickets/{id}        -> ADMIN
 */
@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Slf4j
public class ServiceTicketController {

    private final ServiceTicketService ticketService;

    // ===================================================================
    //  Ticket CRUD
    // ===================================================================

    /**
     * Create a new service ticket.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceTicketResponse>> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {
        log.debug("POST /tickets — vehicleId={}", request.getVehicleId());
        ServiceTicketResponse ticket = ticketService.createTicket(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service ticket created successfully", ticket));
    }

    /**
     * Get a single ticket by ID with full details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceTicketResponse>> getTicket(
            @PathVariable Long id) {
        log.debug("GET /tickets/{}", id);
        ServiceTicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    /**
     * List all tickets, optionally filtered by status.
     * Used by the Kanban board to populate columns.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceTicketResponse>>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {
        log.debug("GET /tickets — status={}", status);
        List<ServiceTicketResponse> tickets = (status != null)
                ? ticketService.getTicketsByStatus(status)
                : ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    /**
     * Update a ticket's mutable fields (description, labor cost, mechanic).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceTicketResponse>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request) {
        log.debug("PUT /tickets/{}", id);
        ServiceTicketResponse ticket = ticketService.updateTicket(id, request);
        return ResponseEntity.ok(ApiResponse.success("Service ticket updated successfully", ticket));
    }

    /**
     * Soft-delete a service ticket.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long id) {
        log.debug("DELETE /tickets/{}", id);
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Service ticket deleted successfully", null));
    }

    // ===================================================================
    //  Status Transitions (Kanban Workflow)
    // ===================================================================

    /**
     * Update only the status of a ticket (Kanban drag-and-drop).
     * Validates the transition against workflow rules.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ServiceTicketResponse>> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        log.debug("PATCH /tickets/{}/status — target={}", id, request.getStatus());
        ServiceTicketResponse ticket = ticketService.updateTicketStatus(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Ticket status updated to " + request.getStatus(), ticket));
    }

    // ===================================================================
    //  Line Item Management
    // ===================================================================

    /**
     * Add a spare part line item to a ticket.
     * Validates stock and atomically decrements inventory.
     */
    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<ServiceTicketResponse>> addTicketItem(
            @PathVariable Long id,
            @Valid @RequestBody AddTicketItemRequest request) {
        log.debug("POST /tickets/{}/items — partId={}, qty={}", id, request.getPartId(), request.getQuantity());
        ServiceTicketResponse ticket = ticketService.addTicketItem(id, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to ticket successfully", ticket));
    }

    /**
     * Remove a spare part line item from a ticket.
     * Restores stock to inventory.
     */
    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<ApiResponse<ServiceTicketResponse>> removeTicketItem(
            @PathVariable Long id,
            @PathVariable Long itemId) {
        log.debug("DELETE /tickets/{}/items/{}", id, itemId);
        ServiceTicketResponse ticket = ticketService.removeTicketItem(id, itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from ticket", ticket));
    }
}
