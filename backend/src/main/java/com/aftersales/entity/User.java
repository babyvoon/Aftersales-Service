package com.aftersales.entity;

import com.aftersales.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * System user entity — represents Admins, Service Advisors, and Mechanics.
 * Stores authentication credentials and role for RBAC.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_role", columnList = "role")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    // ---- Relationships ----

    @OneToMany(mappedBy = "assignedMechanic", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ServiceTicket> assignedTickets = new ArrayList<>();

    // ---- Timestamps ----

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
