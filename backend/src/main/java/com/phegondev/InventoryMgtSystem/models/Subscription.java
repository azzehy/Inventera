package com.phegondev.InventoryMgtSystem.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;
    
    @ManyToOne
    @JoinColumn(name = "plan_id")
    private Plan plan;
    
    private String status; // ACTIVE, CANCELLED, EXPIRED
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}