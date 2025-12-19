package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.phegondev.InventoryMgtSystem.enums.UserRole;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    // Generic
    private int status;
    private String message;
    // for login
    private String token;
    private UserRole role;
    private String expirationTime;

    // for pagination
    private Integer totalPages;
    private Long totalElements;

    // data output optionals
    private UserDTO user;
    private List<UserDTO> users;

    private BusinessPartnerDTO businessPartner;
    private List<BusinessPartnerDTO> businessPartners;

    private CategoryDTO category;
    private List<CategoryDTO> categories;

    private ProductDTO product;
    private List<ProductDTO> products;

    private TransactionDTO transaction;
    private List<TransactionDTO> transactions;

    private TransactionLineDTO transactionLine;
    private List<TransactionLineDTO> transactionLines;

    private EnterpriseDTO enterprise;
    private List<EnterpriseDTO> enterprises;

    private final LocalDateTime timestamp = LocalDateTime.now();

    private List<PlanDTO> planList;
    private PlanDTO plan;
    private SubscriptionDTO subscription;
    private CheckoutResponseDTO checkoutResponse;

}
