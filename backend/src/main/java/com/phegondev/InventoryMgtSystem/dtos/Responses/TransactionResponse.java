package com.phegondev.InventoryMgtSystem.dtos.Responses;

import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private TransactionType transactionType;
    private TransactionStatus status;
    private BigDecimal totalPrice;
    private Integer qtyProducts;
    private String description;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String userName;
    private Long enterpriseId;
    private Long partnerId;
    private String partnerName;
    private List<TransactionLineResponse> details;
}