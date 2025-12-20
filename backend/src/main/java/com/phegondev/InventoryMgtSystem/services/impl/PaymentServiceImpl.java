package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.*;
import com.phegondev.InventoryMgtSystem.models.*;
import com.phegondev.InventoryMgtSystem.repositories.*;
import com.phegondev.InventoryMgtSystem.services.PaymentService;
import com.phegondev.InventoryMgtSystem.services.UserService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

        private final PlanRepository planRepository;
        private final SubscriptionRepository subscriptionRepository;
        private final PaymentRepository paymentRepository;
        private final EnterpriseRepository enterpriseRepository;
        private final UserService userService;

        @Value("${stripe.api.key}")
        private String stripeApiKey;

        @PostConstruct
        public void init() {
                Stripe.apiKey = stripeApiKey;
        }

        @Override
        public Response getAllPlans() {
                List<Plan> plans = planRepository.findAll();
                List<PlanDTO> planDTOs = plans.stream()
                                .map(this::convertToPlanDTO)
                                .collect(Collectors.toList());

                return Response.builder()
                                .status(200)
                                .message("Plans retrieved successfully")
                                .planList(planDTOs)
                                .build();
        }

        @Override
        @Transactional
        public Response createCheckoutSession(CheckoutRequestDTO checkoutRequest) {
                try {
                        User currentUser = userService.getCurrentLoggedInUser();
                        Enterprise enterprise = currentUser.getEnterprise();

                        Plan plan = planRepository.findById(checkoutRequest.getPlanId())
                                        .orElseThrow(() -> new RuntimeException("Plan not found"));

                        if (plan.getStripePriceId() == null) {
                                return Response.builder()
                                                .status(400)
                                                .message("Le plan gratuit ne nécessite pas de paiement")
                                                .build();
                        }

                        subscriptionRepository.findByEnterpriseAndStatus(enterprise, "ACTIVE")
                                        .ifPresent(existingSub -> {
                                                if (existingSub.getPlan().getId().equals(plan.getId())) {
                                                        throw new RuntimeException(
                                                                        "Vous avez déjà un abonnement actif à ce plan");
                                                }
                                        });

                        SessionCreateParams params = SessionCreateParams.builder()
                                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                                        .setSuccessUrl("http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}")
                                        .setCancelUrl("http://localhost:3000/payment/cancel")
                                        .setCustomerEmail(currentUser.getEmail())
                                        .addLineItem(
                                                        SessionCreateParams.LineItem.builder()
                                                                        .setPrice(plan.getStripePriceId())
                                                                        .setQuantity(1L)
                                                                        .build())
                                        .putMetadata("enterprise_id", enterprise.getId().toString())
                                        .putMetadata("plan_id", plan.getId().toString())
                                        .build();

                        Session session = Session.create(params);

                        CheckoutResponseDTO checkoutResponse = new CheckoutResponseDTO();
                        checkoutResponse.setSessionId(session.getId());
                        checkoutResponse.setCheckoutUrl(session.getUrl());

                        return Response.builder()
                                        .status(200)
                                        .message("Session créée")
                                        .checkoutResponse(checkoutResponse)
                                        .build();

                } catch (Exception e) {
                        log.error("Error creating checkout session: {}", e.getMessage());
                        return Response.builder()
                                        .status(500)
                                        .message("Error creating checkout: " + e.getMessage())
                                        .build();
                }
        }

        @Override
        @Transactional
        public Response confirmPayment(String sessionId) {
                try {
                        Session session = Session.retrieve(sessionId);

                        Long enterpriseId = Long.parseLong(session.getMetadata().get("enterprise_id"));

                        Enterprise enterprise = enterpriseRepository.findById(enterpriseId)
                                        .orElseThrow(() -> new RuntimeException("Enterprise not found"));

                        Long planId = Long.parseLong(session.getMetadata().get("plan_id"));

                        Plan plan = planRepository.findById(planId)
                                        .orElseThrow(() -> new RuntimeException("Plan not found"));

                        if (session.getSubscription() != null &&
                                        subscriptionRepository
                                                        .existsByStripeSubscriptionId(session.getSubscription())) {
                                log.info("Abonnement déjà confirmé pour: {}", enterprise.getName());
                                return Response.builder()
                                                .status(200)
                                                .message("Abonnement déjà activé")
                                                .build();
                        }

                        subscriptionRepository.findByEnterpriseAndStatus(enterprise, "ACTIVE")
                                        .ifPresent(oldSub -> {
                                                try {
                                                        if (oldSub.getStripeSubscriptionId() != null) {
                                                                com.stripe.model.Subscription stripeSubscription = com.stripe.model.Subscription
                                                                                .retrieve(oldSub.getStripeSubscriptionId());
                                                                stripeSubscription.cancel();
                                                                log.info("Abonnement Stripe annulé: {}",
                                                                                oldSub.getStripeSubscriptionId());
                                                        }
                                                } catch (StripeException e) {
                                                        log.error("Erreur annulation Stripe: {}", e.getMessage());
                                                }

                                                oldSub.setStatus("CANCELLED");
                                                subscriptionRepository.save(oldSub);
                                                log.info("Ancien abonnement {} remplacé par {} pour: {}",
                                                                oldSub.getPlan().getName(), plan.getName(),
                                                                enterprise.getName());
                                        });
                        
                        

                        Subscription subscription = Subscription.builder()
                                        .enterprise(enterprise)
                                        .plan(plan)
                                        .status("ACTIVE")
                                        .startDate(LocalDateTime.now())
                                        .endDate(LocalDateTime.now().plusMonths(1))
                                        .stripeSubscriptionId(session.getSubscription())
                                        .stripeCustomerId(session.getCustomer())
                                        .build();

                        subscriptionRepository.save(subscription);

                        Payment payment = Payment.builder()
                                        .enterprise(enterprise)
                                        .amount(plan.getPriceMonthly())
                                        .status("SUCCESS")
                                        .paymentDate(LocalDateTime.now())
                                        .build();

                        paymentRepository.save(payment);

                        log.info("Abonnement activé pour: {}", enterprise.getName());

                        return Response.builder()
                                        .status(200)
                                        .message("Abonnement activé avec succès !")
                                        .build();

                } catch (Exception e) {
                        log.error("Error confirming payment: {}", e.getMessage());
                        return Response.builder()
                                        .status(500)
                                        .message("Error confirming payment: " + e.getMessage())
                                        .build();
                }
        }

        @Override
        public Response getMySubscription() {
                User currentUser = userService.getCurrentLoggedInUser();
                Enterprise enterprise = currentUser.getEnterprise();

                Subscription subscription = subscriptionRepository
                                .findByEnterpriseAndStatus(enterprise, "ACTIVE")
                                .orElse(null);

                if (subscription == null) {
                        return Response.builder()
                                        .status(200)
                                        .message("No active subscription")
                                        .build();
                }

                SubscriptionDTO subscriptionDTO = convertToSubscriptionDTO(subscription);

                return Response.builder()
                                .status(200)
                                .message("success")
                                .subscription(subscriptionDTO)
                                .build();
        }

        private PlanDTO convertToPlanDTO(Plan plan) {
                PlanDTO dto = new PlanDTO();
                dto.setId(plan.getId());
                dto.setName(plan.getName());
                dto.setPriceMonthly(plan.getPriceMonthly());
                dto.setMaxProducts(plan.getMaxProducts());
                dto.setMaxUsers(plan.getMaxUsers());
                dto.setStripePriceId(plan.getStripePriceId());
                return dto;
        }

        private SubscriptionDTO convertToSubscriptionDTO(Subscription subscription) {
                SubscriptionDTO dto = new SubscriptionDTO();
                dto.setId(subscription.getId());
                dto.setEnterpriseId(subscription.getEnterprise().getId());
                dto.setEnterpriseName(subscription.getEnterprise().getName());
                dto.setPlan(convertToPlanDTO(subscription.getPlan()));
                dto.setStatus(subscription.getStatus());
                dto.setStartDate(subscription.getStartDate());
                dto.setEndDate(subscription.getEndDate());
                dto.setStripeSubscriptionId(subscription.getStripeSubscriptionId());
                dto.setStripeCustomerId(subscription.getStripeCustomerId());

                if (subscription.getEndDate() != null) {
                        long days = ChronoUnit.DAYS.between(LocalDateTime.now(), subscription.getEndDate());
                        dto.setDaysRemaining((int) Math.max(0, days));
                }

                return dto;
        }
}