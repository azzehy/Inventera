package com.phegondev.InventoryMgtSystem.dtos.Responses;

import com.phegondev.InventoryMgtSystem.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private Long enterpriseId;
}