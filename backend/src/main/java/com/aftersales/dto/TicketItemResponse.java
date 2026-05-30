package com.aftersales.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for a single ticket line item.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketItemResponse {

    private Long id;
    private Long partId;
    private String partNumber;
    private String partName;
    private Integer quantity;
    private BigDecimal pricePerUnit;
    private BigDecimal subtotal;
    private LocalDateTime createdAt;
}
