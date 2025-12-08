package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class BusinessPartnerDTO {
    
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String numero;
    
    private String address;
    
    @Email(message = "Email should be valid")
    private String email;
    
    @NotNull(message = "Type is required")
    private BusinessPartnerType type;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
    
    private String enterpriseName;
}