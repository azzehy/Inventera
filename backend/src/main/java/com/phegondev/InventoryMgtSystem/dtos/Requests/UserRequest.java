package com.phegondev.InventoryMgtSystem.dtos.Requests;

import com.phegondev.InventoryMgtSystem.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String phoneNumber;
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
    @NotNull(message = "Enterprise ID is required")
    private Long enterpriseId;
}
