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
 * Customer entity with soft delete support.
 * A customer can own multiple vehicles.
 * Deleted records are retained for financial auditing.
 */
@Entity
@Table(name = "customers", indexes = {
        @Index(name = "idx_customers_phone", columnList = "phone_number"),
        @Index(name = "idx_customers_deleted_at", columnList = "deleted_at")
})
@SQLDelete(sql = "UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    // ---- Soft Delete ----

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ---- Relationships ----

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

    // ---- Timestamps ----

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
