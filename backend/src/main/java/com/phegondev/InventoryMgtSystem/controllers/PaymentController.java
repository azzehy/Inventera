package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.CheckoutRequestDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/plans")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Response> getAllPlans() {
        return ResponseEntity.ok(paymentService.getAllPlans());
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Response> createCheckout(@RequestBody CheckoutRequestDTO request) {
        return ResponseEntity.ok(paymentService.createCheckoutSession(request));
    }

    // apres redirection Stripe
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Response> confirmPayment(@RequestParam String sessionId) {
        return ResponseEntity.ok(paymentService.confirmPayment(sessionId));
    }

    @GetMapping("/my-subscription")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Response> getMySubscription() {
        return ResponseEntity.ok(paymentService.getMySubscription());
    }
}