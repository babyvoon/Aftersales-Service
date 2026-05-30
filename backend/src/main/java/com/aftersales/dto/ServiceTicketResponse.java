package com.aftersales.dto;

import com.aftersales.enums.TicketStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for a service ticket with full billing breakdown.
 * Includes vehicle, customer, and mechanic summary data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTicketResponse {

    private Long id;
    private String description;
    private TicketStatus status;

    // ---- Billing Breakdown ----
    private BigDecimal laborCost;
    private BigDecimal partsTotal;
    private BigDecimal subtotal;        // laborCost + partsTotal
    private BigDecimal vatAmount;        // subtotal * 7%
    private BigDecimal totalWithVat;     // subtotal + vatAmount

    // ---- Vehicle Info ----
    private Long vehicleId;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleModel;
    private Integer vehicleYear;

    // ---- Customer Info ----
    private Long customerId;
    private String customerName;
    private String customerPhone;

    // ---- Assigned Mechanic ----
    private Long mechanicId;
    private String mechanicName;

    // ---- Line Items ----
    private List<TicketItemResponse> items;

    // ---- Timestamps ----
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
