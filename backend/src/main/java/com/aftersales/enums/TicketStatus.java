package com.aftersales.enums;

/**
 * Represents the lifecycle stages of a service ticket.
 * Maps to the Kanban board columns on the frontend.
 */
public enum TicketStatus {

    /** Ticket created, awaiting assignment or work to begin. */
    PENDING,

    /** Mechanic is actively working on the vehicle. */
    IN_PROGRESS,

    /** Work paused — one or more required parts are not in stock. */
    WAITING_FOR_PARTS,

    /** All work finished, awaiting customer pickup and payment. */
    COMPLETED,

    /** Vehicle handed over to customer, invoice settled. */
    DELIVERED
}
