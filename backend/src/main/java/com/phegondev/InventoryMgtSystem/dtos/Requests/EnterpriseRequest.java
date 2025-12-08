package com.phegondev.InventoryMgtSystem.dtos.Requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnterpriseRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String address;
    
    @Email(message = "Invalid email format")
    private String email;
}
