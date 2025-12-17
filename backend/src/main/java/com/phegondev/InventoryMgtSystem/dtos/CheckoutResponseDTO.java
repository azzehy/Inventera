package com.phegondev.InventoryMgtSystem.dtos;

import lombok.Data;

@Data
public class CheckoutResponseDTO {
    private String sessionId;
    private String checkoutUrl;
}
