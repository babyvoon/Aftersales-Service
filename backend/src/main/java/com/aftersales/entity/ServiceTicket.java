package com.aftersales.entity;

import com.aftersales.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service ticket entity — the core workflow object.
 * Represents a single service job for a vehicle.
 * Soft delete enabled for financial audit trail.
 */
@Entity
@Table(name = "service_tickets", indexes = {
        @Index(name = "idx_tickets_vehicle_id", columnList = "vehicle_id"),
        @Index(name = "idx_tickets_user_id", columnList = "user_id"),
        @Index(name = "idx_tickets_status", columnList = "status"),
        @Index(name = "idx_tickets_deleted_at", columnList = "deleted_at"),
        @Index(name = "idx_tickets_created_at", columnList = "created_at")
})
@SQLDelete(sql = "UPDATE service_tickets SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_tickets_vehicle"))
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",
            foreignKey = @ForeignKey(name = "fk_tickets_user"))
    private User assignedMechanic;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 25)
    @Builder.Default
    private TicketStatus status = TicketStatus.PENDING;

    @Column(name = "labor_cost", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalCost = BigDecimal.ZERO;

    // ---- Soft Delete ----

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ---- Relationships ----

    @OneToMany(mappedBy = "serviceTicket", fetch = FetchType.LAZY,
            cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketItem> ticketItems = new ArrayList<>();

    // ---- Timestamps ----

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ---- Helper Methods ----

    /**
     * Adds a ticket item and maintains the bidirectional relationship.
     */
    public void addTicketItem(TicketItem item) {
        ticketItems.add(item);
        item.setServiceTicket(this);
    }

    /**
     * Removes a ticket item and clears the bidirectional relationship.
     */
    public void removeTicketItem(TicketItem item) {
        ticketItems.remove(item);
        item.setServiceTicket(null);
    }

    /**
     * Recalculates the total cost: sum of all item subtotals + labor cost.
     */
    public void recalculateTotal() {
        BigDecimal partsTotal = ticketItems.stream()
                .map(TicketItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalCost = partsTotal.add(this.laborCost);
    }
}
