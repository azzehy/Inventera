package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.*;
import com.phegondev.InventoryMgtSystem.models.*;
import com.phegondev.InventoryMgtSystem.repositories.*;
import com.phegondev.InventoryMgtSystem.services.PaymentService;
import com.phegondev.InventoryMgtSystem.services.UserService;
import com.stripe.Stripe;
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

    @Value("${stripe.api.key:sk_test_51SZG2X48YBq5H91tqSzwatZIOa17yFOZT17JIU9U1kGv2hUTam11iV6hjBpgoUt2OWIMrukf1hDZMt6KOiWPoeHw00LZiIFwVc}")
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

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl("http://localhost:3000/payment/cancel")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("mad")
                                                    .setUnitAmount(plan.getPriceMonthly()
                                                            .multiply(new BigDecimal("100"))
                                                            .longValue())
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(plan.getName() + " Plan")
                                                                    .setDescription("Subscription for " + plan.getName())
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .setQuantity(1L)
                                    .build()
                    )
                    .putMetadata("enterprise_id", enterprise.getId().toString())
                    .putMetadata("plan_id", plan.getId().toString())
                    .build();

            Session session = Session.create(params);

            CheckoutResponseDTO checkoutResponse = new CheckoutResponseDTO();
            checkoutResponse.setSessionId(session.getId());
            checkoutResponse.setCheckoutUrl(session.getUrl());

            return Response.builder()
                    .status(200)
                    .message("Checkout session created successfully")
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
            Long planId = Long.parseLong(session.getMetadata().get("plan_id"));

            Enterprise enterprise = enterpriseRepository.findById(enterpriseId)
                    .orElseThrow(() -> new RuntimeException("Enterprise not found"));
            
            Plan plan = planRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            Subscription subscription = Subscription.builder()
                    .enterprise(enterprise)
                    .plan(plan)
                    .status("ACTIVE")
                    .startDate(LocalDateTime.now())
                    .endDate(LocalDateTime.now().plusMonths(1))
                    .build();
            
            subscriptionRepository.save(subscription);

            Payment payment = Payment.builder()
                    .enterprise(enterprise)
                    .amount(plan.getPriceMonthly())
                    .status("SUCCESS")
                    .paymentDate(LocalDateTime.now())
                    .build();
            
            paymentRepository.save(payment);

            log.info("Payment confirmed for enterprise: {}, plan: {}", 
                     enterprise.getName(), plan.getName());

            return Response.builder()
                    .status(200)
                    .message("Payment confirmed and subscription activated")
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

        if (subscription.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(LocalDateTime.now(), subscription.getEndDate());
            dto.setDaysRemaining((int) Math.max(0, days));
        }
        
        return dto;
    }
}