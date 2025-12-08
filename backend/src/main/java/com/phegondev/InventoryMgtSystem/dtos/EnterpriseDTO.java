package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class EnterpriseDTO {
    
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String address;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private LocalDateTime createdAt;
    
    private Integer totalUsers;
    private Integer totalProducts;
    private Integer totalCategories;
    private Integer totalPartners;
    private Integer totalTransactions;
}