package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.dtos.TransactionRequest;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.services.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> createTransaction(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.createTransaction(request));
    }

    // hadi marankhdmoch biha (see the comment on the TransactionService 🙂)

    // @PutMapping("/update/{id}")
    // @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    // public ResponseEntity<Response> updateTransaction(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
    //     return ResponseEntity.ok(transactionService.updateTransaction(id, request));
    // }
    
    @DeleteMapping("/delete/{transactionId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN',' MANAGER')")
    public ResponseEntity<Response> deleteTransaction(@PathVariable Long transactionId) {
        return ResponseEntity.ok(transactionService.deleteTransaction(transactionId));
    }

    // nb9aw ndiro create transaction w blamankhdmo bhad purchase/sale/return hit
    // nfss lhaja
    @PostMapping("/purchase")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> purchase(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.purchase(request));
    }

    @PostMapping("/sell")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> sell(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.sell(request));
    }

    @PostMapping("/return")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> returnToSupplier(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.returnToSupplier(request));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<Response> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String filter) {
        return ResponseEntity.ok(transactionService.getAllTransactions(page, size, filter));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getAllTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getAllTransactionById(id));
    }

    @GetMapping("/month/{month}/year/{year}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getAllTransactionsByMonthAndYear(
            @PathVariable int month,
            @PathVariable int year) {
        return ResponseEntity.ok(transactionService.getAllTransactionByMonthAndYear(month, year));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateTransactionStatus(
            @PathVariable Long id,
            @RequestParam TransactionStatus status) {
        return ResponseEntity.ok(transactionService.updateTransactionStatus(id, status));
    }

    @GetMapping("/enterprise/{enterpriseId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getTransactionsByEnterprise(
            @PathVariable Long enterpriseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(transactionService.getTransactionsByEnterprise(enterpriseId, page, size));
    }

    @GetMapping("/partner/{partnerId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getTransactionsByPartner(
            @PathVariable Long partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(transactionService.getTransactionsByPartner(partnerId, page, size));
    }

    // 🙂🐧 on peut utiliser ce get a la place de /enterprise/{enterpriseId}
    @GetMapping("/my-transactions")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(transactionService.getMyEnterpriseTransactions(page, size));
    }
}