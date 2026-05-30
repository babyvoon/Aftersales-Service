package com.aftersales.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Ticket item entity — resolves the many-to-many relationship
 * between service tickets and spare parts.
 * Captures quantity, unit price at time of service, and subtotal.
 */
@Entity
@Table(name = "ticket_items", indexes = {
        @Index(name = "idx_ticket_items_ticket_id", columnList = "ticket_id"),
        @Index(name = "idx_ticket_items_part_id", columnList = "part_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_ticket_items_ticket"))
    private ServiceTicket serviceTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_ticket_items_part"))
    private SparePart sparePart;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "price_per_unit", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal pricePerUnit = BigDecimal.ZERO;

    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    // ---- Timestamps ----

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ---- Helper Methods ----

    /**
     * Calculates the subtotal based on quantity and price per unit.
     * Should be called before persisting or updating.
     */
    @PrePersist
    @PreUpdate
    public void calculateSubtotal() {
        if (this.quantity != null && this.pricePerUnit != null) {
            this.subtotal = this.pricePerUnit.multiply(BigDecimal.valueOf(this.quantity));
        }
    }
}
