package com.aftersales.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Vehicle entity with soft delete support.
 * Each vehicle belongs to exactly one customer.
 * Deleted records are retained for service history auditing.
 */
@Entity
@Table(name = "vehicles", indexes = {
        @Index(name = "idx_vehicles_customer_id", columnList = "customer_id"),
        @Index(name = "idx_vehicles_deleted_at", columnList = "deleted_at")
})
@SQLDelete(sql = "UPDATE vehicles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_vehicles_customer"))
    private Customer customer;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(name = "vin_number", nullable = false, unique = true, length = 17)
    private String vinNumber;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @Column(name = "year", nullable = false)
    private Integer year;

    // ---- Soft Delete ----

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ---- Relationships ----

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ServiceTicket> serviceTickets = new ArrayList<>();

    // ---- Timestamps ----

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
