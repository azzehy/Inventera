package com.phegondev.InventoryMgtSystem.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PlanDTO {
    private Long id;
    private String name;
    private BigDecimal priceMonthly;
    private Integer maxProducts;
    private Integer maxUsers;
}
