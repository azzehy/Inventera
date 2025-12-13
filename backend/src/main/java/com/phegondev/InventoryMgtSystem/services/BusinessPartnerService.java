package com.phegondev.InventoryMgtSystem.services;

import com.phegondev.InventoryMgtSystem.dtos.BusinessPartnerDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;

public interface BusinessPartnerService {
    Response addBusinessPartner(BusinessPartnerDTO businessPartnerDTO);

    Response updateBusinessPartner(Long id, BusinessPartnerDTO businessPartnerDTO);

    Response getAllBusinessPartners();

    Response getBusinessPartnerById(Long id);

    Response deleteBusinessPartner(Long id);

    Response getBusinessPartnersByType(BusinessPartnerType type);

    Response getBusinessPartnersByEnterprise(Long enterpriseId);

    Response getBusinessPartnersByEnterpriseAndType(Long enterpriseId, BusinessPartnerType type);

    Response getMyEnterprisePartners();

    Response getMyEnterprisePartnersByType(BusinessPartnerType type);

    Response getMyEnterpriseSuppliers();

    Response getMyEnterpriseClients();
}