package com.aftersales.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for creating a new service ticket.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketRequest {

    private Long vehicleId;

    private Long mechanicId;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.00", message = "Labor cost must be non-negative")
    @Builder.Default
    private BigDecimal laborCost = BigDecimal.ZERO;

    private String customerName;
    private String customerPhone;
    private String licensePlate;
    private String vehicleBrand;
    private String vehicleModel;
    private Integer vehicleYear;
}
