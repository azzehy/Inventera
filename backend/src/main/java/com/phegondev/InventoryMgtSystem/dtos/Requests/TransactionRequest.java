package com.phegondev.InventoryMgtSystem.dtos.Requests;

import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequest {
    
    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
    
    private Long partnerId; // Obligatoire pour PURCHASE et RETURN_TO_SUPPLIER
    
    private String description;
    
    private String note;
    
    @NotEmpty(message = "Transaction must have at least one product")
    @Valid
    private List<TransactionLineRequest> products;
}