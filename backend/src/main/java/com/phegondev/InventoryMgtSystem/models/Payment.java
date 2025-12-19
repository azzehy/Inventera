package com.phegondev.InventoryMgtSystem.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;
    
    private BigDecimal amount;
    
    private String status; // SUCCESS, FAILED
    
    private LocalDateTime paymentDate;
}