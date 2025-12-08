package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionDTO {
    
    private Long id;
    
    @NotNull(message = "Total price is required")
    private BigDecimal totalPrice;
    
    @NotNull(message = "Quantity of products is required")
    private Integer qtyProducts;
    
    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType; // PURCHASE, SALE, RETURN
    
    @NotNull(message = "Status is required")
    private TransactionStatus status; // PENDING, COMPLETED, PROCESSING
    
    private String description;
    
    private String note;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String userName;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
    
    private String enterpriseName;
    
    private Long partnerId;
    
    private String partnerName;
    
    private List<TransactionLineDTO> details;
    
    private UserDTO user;
    private BusinessPartnerDTO partner;
}