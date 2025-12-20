package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.models.*;
import com.phegondev.InventoryMgtSystem.repositories.*;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping(value = "/stripe", consumes = "application/json", produces = "application/json")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        
        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);

            if ("invoice.payment_succeeded".equals(event.getType())) {
                Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                
                if (invoice != null) {
                    String subId = invoice.getSubscription();

                    Subscription subscription = subscriptionRepository
                            .findByStripeSubscriptionId(subId)
                            .orElse(null);
                    
                    if (subscription != null) {

                        subscription.setEndDate(subscription.getEndDate().plusMonths(1));
                        subscriptionRepository.save(subscription);

                        Payment payment = Payment.builder()
                                .enterprise(subscription.getEnterprise())
                                .amount(subscription.getPlan().getPriceMonthly())
                                .status("SUCCESS")
                                .paymentDate(LocalDateTime.now())
                                .build();
                        paymentRepository.save(payment);
                        
                        log.info("Renouvellement automatique pour: {}", 
                                 subscription.getEnterprise().getName());
                    }
                }
            }

            if ("invoice.payment_failed".equals(event.getType())) {
                Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                
                if (invoice != null) {
                    String subId = invoice.getSubscription();
                    
                    Subscription subscription = subscriptionRepository
                            .findByStripeSubscriptionId(subId)
                            .orElse(null);
                    
                    if (subscription != null) {
                        subscription.setStatus("EXPIRED");
                        subscriptionRepository.save(subscription);
                        
                        log.warn("Paiement échoué pour: {}", 
                                 subscription.getEnterprise().getName());
                    }
                }
            }
            
            return ResponseEntity.ok("OK");
            
        } catch (Exception e) {
            log.error("Erreur webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error");
        }
    }
}