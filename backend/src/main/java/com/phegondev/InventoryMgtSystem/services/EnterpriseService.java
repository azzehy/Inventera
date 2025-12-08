package com.phegondev.InventoryMgtSystem.services;

import com.phegondev.InventoryMgtSystem.dtos.EnterpriseDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;

public interface EnterpriseService {
    Response createEnterprise(EnterpriseDTO enterpriseDTO);
    Response updateEnterprise(Long id, EnterpriseDTO enterpriseDTO);
    Response getAllEnterprises();
    Response getEnterpriseById(Long id);
    Response deleteEnterprise(Long id);
    Response getEnterpriseStats(Long id);
}