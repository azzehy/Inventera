package com.phegondev.InventoryMgtSystem.dtos.Responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal price;
    private Integer quantity;
    private Integer stockMinimum;
    private String description;
    private String imageUrl;
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;
    private Long categoryId;
    private String categoryName;
    private Long enterpriseId;
    private boolean lowStock;
}
