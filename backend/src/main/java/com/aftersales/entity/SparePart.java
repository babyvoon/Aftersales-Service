package com.aftersales.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Spare part entity for inventory management.
 * Tracks part pricing and stock quantities.
 */
@Entity
@Table(name = "spare_parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_number", nullable = false, unique = true, length = 50)
    private String partNumber;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    // ---- Relationships ----

    @OneToMany(mappedBy = "sparePart", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketItem> ticketItems = new ArrayList<>();

    // ---- Timestamps ----

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
