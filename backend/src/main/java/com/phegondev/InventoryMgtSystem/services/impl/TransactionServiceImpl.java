package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.*;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.InvalidCredentialsException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.*;
import com.phegondev.InventoryMgtSystem.repositories.*;
import com.phegondev.InventoryMgtSystem.services.TransactionService;
import com.phegondev.InventoryMgtSystem.services.UserService;
import com.phegondev.InventoryMgtSystem.specification.TransactionFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final BusinessPartnerRepository businessPartnerRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final UserService userService;

    @Override
    @Transactional
    public Response createTransaction(TransactionRequest request) {
        User currentUser = userService.getCurrentLoggedInUser();

        Enterprise enterprise = enterpriseRepository.findById(request.getEnterpriseId())
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(request.getEnterpriseId())) {
                throw new InvalidCredentialsException(
                        "You can only create transactions for your own enterprise");
            }
        }

        BusinessPartner partner = null;
        if (request.getPartnerId() != null) {
            partner = businessPartnerRepository.findById(request.getPartnerId())
                    .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));

            if (!partner.getEnterprise().getId().equals(request.getEnterpriseId())) {
                throw new InvalidCredentialsException(
                        "The business partner does not belong to the specified enterprise");
            }
        }

        Transaction transaction = Transaction.builder()
                .transactionType(request.getTransactionType())
                .status(TransactionStatus.PENDING)
                .enterprise(enterprise)
                .partner(partner)
                .user(currentUser)
                .description(request.getDescription())
                .note(request.getNote())
                .qtyProducts(0)
                .totalPrice(BigDecimal.ZERO)
                .build();

        List<TransactionLine> transactionLines = new ArrayList<>();
        int totalQuantity = 0;
        BigDecimal totalPriceSum = BigDecimal.ZERO;

        for (TransactionLineRequest lineRequest : request.getItems()) {
            Product product = productRepository.findById(lineRequest.getProductId())
                    .orElseThrow(
                            () -> new NotFoundException("Product Not Found with ID: " + lineRequest.getProductId()));

            if (!product.getEnterprise().getId().equals(enterprise.getId())) {
                throw new InvalidCredentialsException(
                        "Product '" + product.getName() + "' does not belong to this enterprise");
            }

            if (request.getTransactionType() == TransactionType.SALE ||
                    request.getTransactionType() == TransactionType.RETURN_TO_SUPPLIER) {
                if (product.getQuantity() < lineRequest.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock for product: " + product.getName()
                            + ". Available: " + product.getQuantity() + ", Required: " + lineRequest.getQuantity());
                }
            }

            BigDecimal unitPrice = lineRequest.getUnitPrice() != null
                    ? lineRequest.getUnitPrice()
                    : product.getPrice();

            BigDecimal lineTotalPrice = unitPrice.multiply(BigDecimal.valueOf(lineRequest.getQuantity()));

            TransactionLine transactionLine = TransactionLine.builder()
                    .transaction(transaction)
                    .product(product)
                    .quantity(lineRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotalPrice)
                    .build();

            transactionLines.add(transactionLine);
            totalQuantity += lineRequest.getQuantity();
            totalPriceSum = totalPriceSum.add(lineTotalPrice);
        }

        transaction.setDetails(transactionLines);
        transaction.setQtyProducts(totalQuantity);
        transaction.setTotalPrice(totalPriceSum);

        transactionRepository.save(transaction);

        return Response.builder()
                .status(200)
                .message("Transaction created successfully with PENDING status")
                .build();
    }

    // this method is for updating transaction but it doesn't work like I want...
    // I should add some things ..don't touch it [the manager can delete the
    // transaction and create a new one instead of update it so we have not to
    // create a new method for updating 🙂💃]

    // @Override
    // @Transactional
    // public Response updateTransaction(Long transactionId, TransactionRequest
    // request) {
    // User currentUser = userService.getCurrentLoggedInUser();

    // Transaction existingTransaction =
    // transactionRepository.findById(transactionId)
    // .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

    // validateTransactionAccess(currentUser, existingTransaction);

    // if (existingTransaction.getStatus() == TransactionStatus.COMPLETED) {
    // throw new IllegalStateException(
    // "Cannot update a COMPLETED transaction. Please cancel it first....And create
    // a new one");
    // }

    // if (existingTransaction.getStatus() == TransactionStatus.CANCELLED) {
    // throw new IllegalStateException(
    // "Cannot update a CANCELLED transaction.");
    // }

    // if
    // (!existingTransaction.getEnterprise().getId().equals(request.getEnterpriseId()))
    // {
    // throw new InvalidCredentialsException(
    // "Cannot change transaction enterprise");
    // }

    // BusinessPartner partner = null;
    // if (request.getPartnerId() != null) {
    // partner = businessPartnerRepository.findById(request.getPartnerId())
    // .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));

    // if (!partner.getEnterprise().getId().equals(request.getEnterpriseId())) {
    // throw new InvalidCredentialsException(
    // "The business partner does not belong to the specified enterprise");
    // }
    // }

    // existingTransaction.setTransactionType(request.getTransactionType());
    // existingTransaction.setPartner(partner);
    // existingTransaction.setDescription(request.getDescription());
    // existingTransaction.setNote(request.getNote());

    // existingTransaction.getDetails().clear();

    // List<TransactionLine> newTransactionLines = new ArrayList<>();
    // int totalQuantity = 0;
    // BigDecimal totalPriceSum = BigDecimal.ZERO;

    // for (TransactionLineRequest lineRequest : request.getItems()) {
    // Product product = productRepository.findById(lineRequest.getProductId())
    // .orElseThrow(() -> new NotFoundException(
    // "Product Not Found with ID: " + lineRequest.getProductId()));

    // if (!product.getEnterprise().getId().equals(request.getEnterpriseId())) {
    // throw new InvalidCredentialsException(
    // "Product '" + product.getName() + "' does not belong to this enterprise");
    // }

    // if (request.getTransactionType() == TransactionType.SALE ||
    // request.getTransactionType() == TransactionType.RETURN_TO_SUPPLIER) {
    // if (product.getQuantity() < lineRequest.getQuantity()) {
    // throw new IllegalArgumentException(
    // "Insufficient stock for product: " + product.getName() +
    // ". Available: " + product.getQuantity() +
    // ", Required: " + lineRequest.getQuantity());
    // }
    // }

    // BigDecimal unitPrice = lineRequest.getUnitPrice() != null
    // ? lineRequest.getUnitPrice()
    // : product.getPrice();

    // BigDecimal lineTotalPrice = unitPrice.multiply(
    // BigDecimal.valueOf(lineRequest.getQuantity()));

    // TransactionLine transactionLine = TransactionLine.builder()
    // .transaction(existingTransaction)
    // .product(product)
    // .quantity(lineRequest.getQuantity())
    // .unitPrice(unitPrice)
    // .totalPrice(lineTotalPrice)
    // .build();

    // newTransactionLines.add(transactionLine);
    // totalQuantity += lineRequest.getQuantity();
    // totalPriceSum = totalPriceSum.add(lineTotalPrice);
    // }

    // existingTransaction.setDetails(newTransactionLines);
    // existingTransaction.setQtyProducts(totalQuantity);
    // existingTransaction.setTotalPrice(totalPriceSum);
    // existingTransaction.setUpdatedAt(LocalDateTime.now());

    // transactionRepository.save(existingTransaction);

    // log.info("Transaction {} updated by user {}", transactionId,
    // currentUser.getId());

    // return Response.builder()
    // .status(200)
    // .message("Transaction updated successfully")
    // .build();
    // }

    @Override
    @Transactional
    public Response deleteTransaction(Long transactionId) {
        User currentUser = userService.getCurrentLoggedInUser();

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

        validateTransactionAccess(currentUser, transaction);

        if (transaction.getStatus() == TransactionStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Cannot delete a COMPLETED transaction. Please cancel it first before deletion.");
        }

        transactionRepository.delete(transaction);

        return Response.builder()
                .status(200)
                .message("Transaction deleted successfully")
                .build();
    }

    @Override
    @Transactional
    public Response purchase(TransactionRequest transactionRequest) {
        transactionRequest.setTransactionType(TransactionType.PURCHASE);
        return createTransaction(transactionRequest);
    }

    @Override
    @Transactional
    public Response sell(TransactionRequest transactionRequest) {
        transactionRequest.setTransactionType(TransactionType.SALE);
        return createTransaction(transactionRequest);
    }

    @Override
    @Transactional
    public Response returnToSupplier(TransactionRequest transactionRequest) {
        transactionRequest.setTransactionType(TransactionType.RETURN_TO_SUPPLIER);
        return createTransaction(transactionRequest);
    }

    @Override
    public Response getAllTransactions(int page, int size, String filter) {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException("Only SUPER_ADMIN can view all transactions");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Specification<Transaction> spec = TransactionFilter.byFilter(filter);
        Page<Transaction> transactionPage = transactionRepository.findAll(spec, pageable);

        List<TransactionDTO> transactionDTOS = transactionPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .transactions(transactionDTOS)
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .build();
    }

    @Override
    public Response getAllTransactionById(Long id) {
        User currentUser = userService.getCurrentLoggedInUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

        validateTransactionAccess(currentUser, transaction);
        TransactionDTO transactionDTO = mapToDTOWithDetails(transaction);

        return Response.builder()
                .status(200)
                .message("success")
                .transaction(transactionDTO)
                .build();
    }

    @Override
    public Response getAllTransactionByMonthAndYear(int month, int year) {
        User currentUser = userService.getCurrentLoggedInUser();
        Specification<Transaction> spec = TransactionFilter.byMonthAndYear(month, year);

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            Specification<Transaction> enterpriseSpec = (root, query, cb) -> cb.equal(
                    root.get("enterprise").get("id"),
                    currentUser.getEnterprise().getId());
            spec = spec.and(enterpriseSpec);
        }

        List<Transaction> transactions = transactionRepository.findAll(spec);

        List<TransactionDTO> transactionDTOS = transactions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .transactions(transactionDTOS)
                .build();
    }

    @Override
    @Transactional
    public Response updateTransactionStatus(Long transactionId, TransactionStatus status) {
        User currentUser = userService.getCurrentLoggedInUser();

        Transaction existingTransaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

        validateTransactionAccess(currentUser, existingTransaction);

        TransactionStatus oldStatus = existingTransaction.getStatus();

        switch (status) {
            case PROCESSING:
                if (oldStatus != TransactionStatus.PENDING) {
                    throw new IllegalStateException(
                            "Only PENDING transactions can be moved to PROCESSING, You tried to move from "
                                    + oldStatus);
                }
                break;
            case COMPLETED:
                if (oldStatus == TransactionStatus.COMPLETED) {
                    throw new IllegalStateException("Transaction is already COMPLETED");
                }
                if (oldStatus == TransactionStatus.CANCELLED) {
                    throw new IllegalStateException("Cannot complete a CANCELLED transaction");
                }
                applyStockChanges(existingTransaction, false);
                break;
            case CANCELLED:
                if (oldStatus == TransactionStatus.CANCELLED) {
                    throw new IllegalStateException("Transaction is already CANCELLED");
                }
                if (oldStatus == TransactionStatus.COMPLETED) {
                    applyStockChanges(existingTransaction, true);
                }
                break;
            case PENDING:
                throw new IllegalStateException("Cannot move back to PENDING status");
        }

        existingTransaction.setStatus(status);
        existingTransaction.setUpdatedAt(LocalDateTime.now());

        transactionRepository.save(existingTransaction);

        return Response.builder()
                .status(200)
                .message("Transaction Status Successfully Updated to " + status)
                .build();
    }

    private void applyStockChanges(Transaction transaction, boolean reverse) {
        for (TransactionLine line : transaction.getDetails()) {
            Product product = line.getProduct();
            Integer quantity = line.getQuantity();
            TransactionType type = transaction.getTransactionType();
            if (reverse) {
                type = reverseTransactionType(type);
            }

            updateProductStock(product, quantity, type);
        }
    }

    private TransactionType reverseTransactionType(TransactionType type) {
        switch (type) {
            case PURCHASE:
                return TransactionType.SALE;
            case SALE:
                return TransactionType.PURCHASE;
            case RETURN_TO_SUPPLIER:
                return TransactionType.PURCHASE;
            default:
                throw new IllegalArgumentException("Unknown transaction type: " + type);
        }
    }

    @Override
    public Response getTransactionsByEnterprise(Long enterpriseId, int page, int size) {
        User currentUser = userService.getCurrentLoggedInUser();

        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(enterpriseId)) {
                throw new InvalidCredentialsException(
                        "You can only view transactions from your own enterprise");
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Transaction> transactionPage = transactionRepository.findByEnterpriseId(enterpriseId, pageable);

        List<TransactionDTO> transactionDTOS = transactionPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .transactions(transactionDTOS)
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .build();
    }

    @Override
    public Response getTransactionsByPartner(Long partnerId, int page, int size) {
        User currentUser = userService.getCurrentLoggedInUser();

        BusinessPartner partner = businessPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!partner.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
                throw new InvalidCredentialsException(
                        "This partner does not belong to your enterprise");
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Transaction> transactionPage = transactionRepository.findByPartnerId(partnerId, pageable);

        List<TransactionDTO> transactionDTOS = transactionPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .transactions(transactionDTOS)
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .build();
    }

    @Override
    public Response getMyEnterpriseTransactions(int page, int size) {
        User currentUser = userService.getCurrentLoggedInUser();
        return getTransactionsByEnterprise(currentUser.getEnterprise().getId(), page, size);
    }

    private void validateTransactionAccess(User currentUser, Transaction transaction) {
        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }

        if (!transaction.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
            throw new InvalidCredentialsException(
                    "You can only access transactions from your own enterprise");
        }
    }

    private void updateProductStock(Product product, Integer quantity, TransactionType type) {
        switch (type) {
            case PURCHASE:
                product.setQuantity(product.getQuantity() + quantity);
                break;
            case SALE:
            case RETURN_TO_SUPPLIER:
                if (product.getQuantity() < quantity) {
                    throw new IllegalArgumentException("Insufficient stock for product: " + product.getName()
                            + ". Available: " + product.getQuantity() + ", Required: " + quantity);
                }
                product.setQuantity(product.getQuantity() - quantity);
                break;
        }
        productRepository.save(product);
    }

    private TransactionDTO mapToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setTotalPrice(transaction.getTotalPrice());
        dto.setQtyProducts(transaction.getQtyProducts());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setStatus(transaction.getStatus());
        dto.setDescription(transaction.getDescription());
        dto.setNote(transaction.getNote());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        dto.setUserId(transaction.getUser().getId());
        dto.setUserName(transaction.getUser().getName());
        dto.setEnterpriseId(transaction.getEnterprise().getId());
        dto.setEnterpriseName(transaction.getEnterprise().getName());

        if (transaction.getPartner() != null) {
            dto.setPartnerId(transaction.getPartner().getId());
            dto.setPartnerName(transaction.getPartner().getName());
        }

        return dto;
    }

    private TransactionDTO mapToDTOWithDetails(Transaction transaction) {
        TransactionDTO dto = mapToDTO(transaction);

        if (transaction.getDetails() != null && !transaction.getDetails().isEmpty()) {
            List<TransactionLineDTO> lineDTOs = transaction.getDetails().stream()
                    .map(this::mapLineToDTO)
                    .collect(Collectors.toList());
            dto.setDetails(lineDTOs);
        }

        return dto;
    }

    private TransactionLineDTO mapLineToDTO(TransactionLine line) {
        TransactionLineDTO dto = new TransactionLineDTO();
        dto.setId(line.getId());
        dto.setProductId(line.getProduct().getId());
        dto.setProductName(line.getProduct().getName());
        dto.setProductSku(line.getProduct().getSku());
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setLineTotal(line.getTotalPrice());
        dto.setTransactionId(line.getTransaction().getId());
        return dto;
    }
}