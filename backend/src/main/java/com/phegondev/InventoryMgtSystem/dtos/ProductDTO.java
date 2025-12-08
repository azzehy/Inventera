package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDTO {
    
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "SKU is required")
    private String sku;
    
    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal price;
    
    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity must be positive or zero")
    private Integer quantity;
    
    @NotNull(message = "Stock minimum is required")
    @PositiveOrZero(message = "Stock minimum must be positive or zero")
    private Integer stockMinimum;
    
    private String description;
    
    private LocalDateTime expiryDate;
    
    private String imageUrl;
    
    private LocalDateTime createdAt;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
    
    private String enterpriseName;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private String categoryName;
}