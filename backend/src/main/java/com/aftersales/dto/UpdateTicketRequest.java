package com.aftersales.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for updating an existing service ticket.
 * All fields are optional — only non-null fields will be applied.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTicketRequest {

    private Long mechanicId;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.00", message = "Labor cost must be non-negative")
    private BigDecimal laborCost;
}
