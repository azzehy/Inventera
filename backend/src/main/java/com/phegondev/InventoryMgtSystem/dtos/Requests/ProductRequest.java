package com.phegondev.InventoryMgtSystem.dtos.Requests;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProductRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String sku;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;
    
    @NotNull(message = "Stock minimum is required")
    @Min(value = 0, message = "Stock minimum cannot be negative")
    private Integer stockMinimum;
    
    private String description;
    private String imageUrl;
    private LocalDateTime expiryDate;
    
    private Long categoryId;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
}
