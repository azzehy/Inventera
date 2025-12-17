package com.phegondev.InventoryMgtSystem.services;

import com.phegondev.InventoryMgtSystem.dtos.CheckoutRequestDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;

public interface PaymentService {
    

    Response getAllPlans();

    Response createCheckoutSession(CheckoutRequestDTO checkoutRequest);

    Response confirmPayment(String sessionId);

    Response getMySubscription();
}