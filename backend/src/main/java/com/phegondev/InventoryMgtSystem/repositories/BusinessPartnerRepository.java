package com.phegondev.InventoryMgtSystem.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.phegondev.InventoryMgtSystem.models.BusinessPartner;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BusinessPartnerRepository extends JpaRepository<BusinessPartner, Long> {
    List<BusinessPartner> findByEnterpriseId(Long enterpriseId);
    List<BusinessPartner> findByEnterpriseIdAndType(Long enterpriseId, BusinessPartnerType type);
    List<BusinessPartner> findByType(BusinessPartnerType type);
    boolean existsByEmailAndEnterpriseId(String email, Long enterpriseId);
    boolean existsByNumeroAndEnterpriseId(String numero, Long enterpriseId);
}