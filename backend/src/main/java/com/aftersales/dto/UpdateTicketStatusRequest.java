package com.aftersales.dto;

import com.aftersales.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO for updating only the status of a service ticket.
 * Used by the Kanban board for drag-and-drop status transitions.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;
}
