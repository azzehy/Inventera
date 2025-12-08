package com.phegondev.InventoryMgtSystem.dtos.Responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseResponse {
    private Long id;
    private String name;
    private String address;
    private String email;
    private LocalDateTime createdAt;
}
