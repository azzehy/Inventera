package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.BusinessPartnerDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.BusinessPartner;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.repositories.BusinessPartnerRepository;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.services.BusinessPartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BusinessPartnerServiceImpl implements BusinessPartnerService {
    
    private final BusinessPartnerRepository businessPartnerRepository;
    private final EnterpriseRepository enterpriseRepository;

    @Override
    public Response addBusinessPartner(BusinessPartnerDTO businessPartnerDTO) {

        Enterprise enterprise = enterpriseRepository.findById(businessPartnerDTO.getEnterpriseId())
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
        
        BusinessPartner businessPartnerToSave = BusinessPartner.builder()
                .name(businessPartnerDTO.getName())
                .numero(businessPartnerDTO.getNumero())
                .address(businessPartnerDTO.getAddress())
                .Email(businessPartnerDTO.getEmail())
                .type(businessPartnerDTO.getType())
                .enterprise(enterprise)
                .build();
        
        businessPartnerRepository.save(businessPartnerToSave);
        
        String partnerTypeMessage = businessPartnerDTO.getType() == BusinessPartnerType.SUPPLIER 
            ? "Supplier" : "Client";
        
        return Response.builder()
                .status(200)
                .message(partnerTypeMessage + " Saved Successfully")
                .build();
    }

    @Override
    public Response updateBusinessPartner(Long id, BusinessPartnerDTO businessPartnerDTO) {
        BusinessPartner existingPartner = businessPartnerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));
        
        if (businessPartnerDTO.getName() != null) {
            existingPartner.setName(businessPartnerDTO.getName());
        }
        if (businessPartnerDTO.getNumero() != null) {
            existingPartner.setNumero(businessPartnerDTO.getNumero());
        }
        if (businessPartnerDTO.getAddress() != null) {
            existingPartner.setAddress(businessPartnerDTO.getAddress());
        }
        if (businessPartnerDTO.getEmail() != null) {
            existingPartner.setEmail(businessPartnerDTO.getEmail());
        }
        if (businessPartnerDTO.getType() != null) {
            existingPartner.setType(businessPartnerDTO.getType());
        }
        if (businessPartnerDTO.getEnterpriseId() != null && 
            !businessPartnerDTO.getEnterpriseId().equals(existingPartner.getEnterprise().getId())) {
            Enterprise enterprise = enterpriseRepository.findById(businessPartnerDTO.getEnterpriseId())
                    .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
            existingPartner.setEnterprise(enterprise);
        }
        
        businessPartnerRepository.save(existingPartner);
        
        String partnerTypeMessage = businessPartnerDTO.getType() == BusinessPartnerType.SUPPLIER 
            ? "Supplier" : "Client";

        return Response.builder()
                .status(200)
                .message(partnerTypeMessage+" Was Successfully Updated")
                .build();
    }

    @Override
    public Response getAllBusinessPartners() {
        List<BusinessPartner> partners = businessPartnerRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        
        List<BusinessPartnerDTO> partnerDTOList = partners.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return Response.builder()
                .status(200)
                .message("success")
                .businessPartners(partnerDTOList)
                .build();
    }

    @Override
    public Response getBusinessPartnerById(Long id) {
        BusinessPartner partner = businessPartnerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));
        
        BusinessPartnerDTO partnerDTO = mapToDTO(partner);
        
        return Response.builder()
                .status(200)
                .message("success")
                .businessPartner(partnerDTO)
                .build();
    }

    @Override
    public Response deleteBusinessPartner(Long id) {
        businessPartnerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));
        
        businessPartnerRepository.deleteById(id);
        
        return Response.builder()
                .status(200)
                .message("Business Partner Was Successfully Deleted")
                .build();
    }

    @Override
    public Response getBusinessPartnersByType(BusinessPartnerType type) {
        List<BusinessPartner> partners = businessPartnerRepository.findByType(type);
        
        List<BusinessPartnerDTO> partnerDTOList = partners.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        String typeLabel = type == BusinessPartnerType.SUPPLIER ? "Suppliers" : "Clients";
        
        return Response.builder()
                .status(200)
                .message("get "+typeLabel+" successfully")
                .businessPartners(partnerDTOList)
                .build();
    }

    @Override
    public Response getBusinessPartnersByEnterprise(Long enterpriseId) {
        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
        
        List<BusinessPartner> partners = businessPartnerRepository.findByEnterpriseId(enterpriseId);
        
        List<BusinessPartnerDTO> partnerDTOList = partners.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return Response.builder()
                .status(200)
                .message("success")
                .businessPartners(partnerDTOList)
                .build();
    }

    @Override
    public Response getBusinessPartnersByEnterpriseAndType(Long enterpriseId, BusinessPartnerType type) {
        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
        
        List<BusinessPartner> partners = businessPartnerRepository.findByEnterpriseIdAndType(enterpriseId, type);
        
        List<BusinessPartnerDTO> partnerDTOList = partners.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        String typeLabel = type == BusinessPartnerType.SUPPLIER ? "Suppliers" : "Clients";
        
        return Response.builder()
                .status(200)
                .message("get "+typeLabel+" successfully")
                .businessPartners(partnerDTOList)
                .build();
    }
    
    private BusinessPartnerDTO mapToDTO(BusinessPartner partner) {
        BusinessPartnerDTO dto = new BusinessPartnerDTO();
        dto.setId(partner.getId());
        dto.setName(partner.getName());
        dto.setNumero(partner.getNumero());
        dto.setAddress(partner.getAddress());
        dto.setEmail(partner.getEmail());
        dto.setType(partner.getType());
        dto.setEnterpriseId(partner.getEnterprise().getId());
        dto.setEnterpriseName(partner.getEnterprise().getName());
        return dto;
    }
}