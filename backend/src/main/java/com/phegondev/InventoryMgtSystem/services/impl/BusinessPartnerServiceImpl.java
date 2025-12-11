package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.BusinessPartnerDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.InvalidCredentialsException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.BusinessPartner;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.models.User;
import com.phegondev.InventoryMgtSystem.repositories.BusinessPartnerRepository;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.services.BusinessPartnerService;
import com.phegondev.InventoryMgtSystem.services.UserService;
import org.springframework.transaction.annotation.Transactional;
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
    private final UserService userService;

    @Override
    @Transactional
    public Response addBusinessPartner(BusinessPartnerDTO businessPartnerDTO) {
        User currentUser = userService.getCurrentLoggedInUser();

        Enterprise enterprise = enterpriseRepository.findById(businessPartnerDTO.getEnterpriseId())
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
        
        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(businessPartnerDTO.getEnterpriseId())) {
                throw new InvalidCredentialsException(
                    "You can only create business partners for your own enterprise");
            }
    
        }
        if (businessPartnerDTO.getEmail() != null && 
            businessPartnerRepository.existsByEmailAndEnterpriseId(
                businessPartnerDTO.getEmail(), enterprise.getId())) {
            throw new IllegalArgumentException(
                "A business partner with the email '" + businessPartnerDTO.getEmail() + 
                "' already exists in this enterprise");
        }
        if (businessPartnerDTO.getNumero() != null && 
            businessPartnerRepository.existsByNumeroAndEnterpriseId(
                businessPartnerDTO.getNumero(), enterprise.getId())) {
            throw new IllegalArgumentException(
                "A business partner with the number '" + businessPartnerDTO.getNumero() + 
                "' already exists in this enterprise");
        }
        BusinessPartner businessPartnerToSave = BusinessPartner.builder()
                .name(businessPartnerDTO.getName())
                .numero(businessPartnerDTO.getNumero())
                .address(businessPartnerDTO.getAddress())
                .email(businessPartnerDTO.getEmail())
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
    @Transactional
    public Response updateBusinessPartner(Long id, BusinessPartnerDTO businessPartnerDTO) {
        User currentUser = userService.getCurrentLoggedInUser();

        BusinessPartner existingPartner = businessPartnerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));
        
        validatePartnerAccess(currentUser, existingPartner);

        if (businessPartnerDTO.getName() != null && !businessPartnerDTO.getName().isBlank()) {
            existingPartner.setName(businessPartnerDTO.getName());
        }
        if (businessPartnerDTO.getNumero() != null && !businessPartnerDTO.getNumero().isBlank()
            && !businessPartnerDTO.getNumero().equals(existingPartner.getNumero())) {
            if (businessPartnerRepository.existsByNumeroAndEnterpriseId(
                    businessPartnerDTO.getNumero(), existingPartner.getEnterprise().getId())) {
                throw new IllegalArgumentException(
                    "A business partner with the number '" + businessPartnerDTO.getNumero() + 
                    "' already exists in this enterprise");
            }
            existingPartner.setNumero(businessPartnerDTO.getNumero());
        }
        if (businessPartnerDTO.getAddress() != null) {
            existingPartner.setAddress(businessPartnerDTO.getAddress());
        }
        if (businessPartnerDTO.getEmail() != null && !businessPartnerDTO.getEmail().isBlank()
            && !businessPartnerDTO.getEmail().equals(existingPartner.getEmail())) {
            if (businessPartnerRepository.existsByEmailAndEnterpriseId(
                    businessPartnerDTO.getEmail(), existingPartner.getEnterprise().getId())) {
                throw new IllegalArgumentException(
                    "A business partner with the email '" + businessPartnerDTO.getEmail() + 
                    "' already exists in this enterprise");
            }
            existingPartner.setEmail(businessPartnerDTO.getEmail());
        }
        if (businessPartnerDTO.getType() != null) {
            existingPartner.setType(businessPartnerDTO.getType());
        }
        if (businessPartnerDTO.getEnterpriseId() != null && 
            !businessPartnerDTO.getEnterpriseId().equals(existingPartner.getEnterprise().getId())) {

            if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                throw new InvalidCredentialsException(
                    "Only SUPER_ADMIN can change a business partner's enterprise");
            }

            Enterprise enterprise = enterpriseRepository.findById(businessPartnerDTO.getEnterpriseId())
                    .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
            if (existingPartner.getEmail() != null && 
                businessPartnerRepository.existsByEmailAndEnterpriseId(
                    existingPartner.getEmail(), enterprise.getId())) {
                throw new IllegalArgumentException(
                    "A business partner with this email already exists in the target enterprise");
            }

            existingPartner.setEnterprise(enterprise);
        }
        
        businessPartnerRepository.save(existingPartner);
        
        String partnerTypeMessage = existingPartner.getType() == BusinessPartnerType.SUPPLIER 
            ? "Supplier" : "Client";

        return Response.builder()
                .status(200)
                .message(partnerTypeMessage+" Was Successfully Updated")
                .build();
    }

    @Override
    public Response getAllBusinessPartners() {
        User currentUser = userService.getCurrentLoggedInUser();

        if ((currentUser.getRole() != UserRole.SUPER_ADMIN)) {
            throw new InvalidCredentialsException("Only SUPER_ADMIN can view all business partners");
        }

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
        User currentUser = userService.getCurrentLoggedInUser();

        BusinessPartner partner = businessPartnerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));
        
        validatePartnerAccess(currentUser, partner);

        BusinessPartnerDTO partnerDTO = mapToDTO(partner);
        
        return Response.builder()
                .status(200)
                .message("success")
                .businessPartner(partnerDTO)
                .build();
    }

    @Override
    @Transactional
    public Response deleteBusinessPartner(Long id) {
        User currentUser = userService.getCurrentLoggedInUser();

        BusinessPartner partner = businessPartnerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business Partner Not Found"));
        
        validatePartnerAccess(currentUser, partner);

        if (partner.getTransactions() != null && !partner.getTransactions().isEmpty()) {
            String partnerType = partner.getType() == BusinessPartnerType.SUPPLIER 
                ? "supplier" : "client";
            throw new IllegalArgumentException(
                "Cannot delete " + partnerType + " '" + partner.getName() + 
                "' because it has " + partner.getTransactions().size() + " transaction(s) associated with it. " +
                "Cannot delete business partners with transaction history.");
        }

        businessPartnerRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Business Partner Was Successfully Deleted")
                .build();
    }

    @Override
    public Response getBusinessPartnersByType(BusinessPartnerType type) {
        User currentUser = userService.getCurrentLoggedInUser();

        List<BusinessPartner> partners;
        
        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            partners = businessPartnerRepository.findByType(type);
        } else {
            partners = businessPartnerRepository.findByEnterpriseIdAndType(
                currentUser.getEnterprise().getId(), type);
        }

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
        User currentUser = userService.getCurrentLoggedInUser();

        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
        
        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(enterpriseId)) {
                throw new InvalidCredentialsException(
                    "You can only view business partners from your own enterprise");
            }
        }

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
        User currentUser = userService.getCurrentLoggedInUser();

        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(enterpriseId)) {
                throw new InvalidCredentialsException(
                    "You can only view business partners from your own enterprise");
            }
        }

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
    
    // A SUPPRIMER 🙂
    @Override
    public Response getMyEnterprisePartners() {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException(
                "SUPER_ADMIN is not associated with a specific enterprise. " +
                "Use /api/business-partners/all to view all partners.");
        }

        return getBusinessPartnersByEnterprise(currentUser.getEnterprise().getId());
    }

    // A SUPPRIMER 🙂
    @Override
    public Response getMyEnterprisePartnersByType(BusinessPartnerType type) {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException(
                "SUPER_ADMIN is not associated with a specific enterprise. " +
                "Use /api/business-partners/type/{type} to view partners by type.");
        }

        return getBusinessPartnersByEnterpriseAndType(currentUser.getEnterprise().getId(), type);
    }

    // 🙂🐧
    @Override
    public Response getMyEnterpriseSuppliers() {
        return getMyEnterprisePartnersByType(BusinessPartnerType.SUPPLIER);
    }
    // 🙂🐧
    @Override
    public Response getMyEnterpriseClients() {
        return getMyEnterprisePartnersByType(BusinessPartnerType.CLIENT);
    }

    private void validatePartnerAccess(User currentUser, BusinessPartner partner) {
        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }

        if (!partner.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
            throw new InvalidCredentialsException(
                "You can only access business partners from your own enterprise");
        }
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