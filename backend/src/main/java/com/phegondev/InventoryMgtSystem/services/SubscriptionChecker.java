package com.phegondev.InventoryMgtSystem.services;

import com.phegondev.InventoryMgtSystem.models.Enterprise;

public interface SubscriptionChecker {

    boolean canAddProduct(Enterprise enterprise);
    
    boolean canAddUser(Enterprise enterprise);

    int getRemainingProducts(Enterprise enterprise);

    int getRemainingUsers(Enterprise enterprise);
}