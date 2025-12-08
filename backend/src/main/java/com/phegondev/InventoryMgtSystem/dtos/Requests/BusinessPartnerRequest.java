package com.phegondev.InventoryMgtSystem.dtos.Requests;

import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BusinessPartnerRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String numero;
    private String address;
    private String email;
    
    @NotNull(message = "Type is required")
    private BusinessPartnerType type;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
}
