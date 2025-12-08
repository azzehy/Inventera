package com.phegondev.InventoryMgtSystem.dtos.Responses;

import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessPartnerResponse {
    private Long id;
    private String name;
    private String numero;
    private String address;
    private String email;
    private BusinessPartnerType type;
    private Long enterpriseId;
}
