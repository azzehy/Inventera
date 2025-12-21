package com.phegondev.InventoryMgtSystem.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionDTO {
    private Long id;
    private Long enterpriseId;
    private String enterpriseName;
    private PlanDTO plan;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String stripeSubscriptionId;
    private String stripeCustomerId;
    private Integer daysRemaining;
}
