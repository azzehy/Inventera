package com.phegondev.InventoryMgtSystem.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name; // FREE, BASIC, PREMIUM
    
    private BigDecimal priceMonthly;
    
    private Integer maxProducts;
    
    private Integer maxUsers;
}