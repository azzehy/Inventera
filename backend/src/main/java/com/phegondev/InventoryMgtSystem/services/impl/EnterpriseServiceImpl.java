package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.EnterpriseDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.InvalidCredentialsException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.services.EnterpriseService;
import com.phegondev.InventoryMgtSystem.services.UserService;
import com.phegondev.InventoryMgtSystem.models.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;
    private final UserService userService;

    @Override
    @Transactional
    public Response createEnterprise(EnterpriseDTO enterpriseDTO) {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException("Only SUPER_ADMIN can create enterprises");
        }

        if (enterpriseRepository.existsByName(enterpriseDTO.getName())) {
            throw new IllegalArgumentException(
                "An enterprise with the name '" + enterpriseDTO.getName() + "' already exists");
        }

        if (enterpriseDTO.getEmail() != null && enterpriseRepository.existsByEmail(enterpriseDTO.getEmail())) {
            throw new IllegalArgumentException(
                "An enterprise with the email '" + enterpriseDTO.getEmail() + "' already exists");
        }

        Enterprise enterprise = Enterprise.builder()
                .name(enterpriseDTO.getName())
                .address(enterpriseDTO.getAddress())
                .email(enterpriseDTO.getEmail())
                .build();

        enterpriseRepository.save(enterprise);

        log.info("Enterprise '{}' created successfully by SUPER_ADMIN: {}", 
                 enterprise.getName(), currentUser.getEmail());

        return Response.builder()
                .status(200)
                .message("Enterprise created successfully")
                .build();
    }

    @Override
    @Transactional
    public Response updateEnterprise(Long id, EnterpriseDTO enterpriseDTO) {
        User currentUser = userService.getCurrentLoggedInUser();

        Enterprise existingEnterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        validateEnterpriseAccess(currentUser, existingEnterprise);

        if (enterpriseDTO.getName() != null && !enterpriseDTO.getName().isBlank()
            && !enterpriseDTO.getName().equals(existingEnterprise.getName())) {
            if (enterpriseRepository.existsByName(enterpriseDTO.getName())) {
                throw new IllegalArgumentException(
                    "An enterprise with the name '" + enterpriseDTO.getName() + "' already exists");
            }
            existingEnterprise.setName(enterpriseDTO.getName());
        }

        if (enterpriseDTO.getAddress() != null) {
            existingEnterprise.setAddress(enterpriseDTO.getAddress());
        }

        if (enterpriseDTO.getEmail() != null && !enterpriseDTO.getEmail().isBlank()
            && !enterpriseDTO.getEmail().equals(existingEnterprise.getEmail())) {
            if (enterpriseRepository.existsByEmail(enterpriseDTO.getEmail())) {
                throw new IllegalArgumentException(
                    "An enterprise with the email '" + enterpriseDTO.getEmail() + "' already exists");
            }
            existingEnterprise.setEmail(enterpriseDTO.getEmail());
        }

        enterpriseRepository.save(existingEnterprise);

        return Response.builder()
                .status(200)
                .message("Enterprise updated successfully")
                .build();
    }

    @Override
    public Response getAllEnterprises() {
        User currentUser = userService.getCurrentLoggedInUser();
        
        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException("Only SUPER_ADMIN can view all enterprises");
        }

        List<Enterprise> enterprises = enterpriseRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<EnterpriseDTO> enterpriseDTOS = enterprises.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .enterprises(enterpriseDTOS)
                .build();
    }

    @Override
    public Response getEnterpriseById(Long id) {
        User currentUser = userService.getCurrentLoggedInUser();
        
        Enterprise enterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        validateEnterpriseAccess(currentUser, enterprise);

        EnterpriseDTO enterpriseDTO = mapToDTO(enterprise);

        return Response.builder()
                .status(200)
                .message("success")
                .enterprise(enterpriseDTO)
                .build();
    }

    @Override
    @Transactional
    public Response deleteEnterprise(Long id) {
        User currentUser = userService.getCurrentLoggedInUser();
        
        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException("Only SUPER_ADMIN can delete enterprises");
        }

        Enterprise enterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (enterprise.getUsers() != null && !enterprise.getUsers().isEmpty()) {
            throw new IllegalArgumentException(
                "Cannot delete enterprise '" + enterprise.getName() + 
                "' because it has " + enterprise.getUsers().size() + " active user(s). " +
                "Please remove or transfer all users first.");
        }
        if (enterprise.getProducts() != null && !enterprise.getProducts().isEmpty()) {
            throw new IllegalArgumentException(
                "Cannot delete enterprise '" + enterprise.getName() + 
                "' because it has " + enterprise.getProducts().size() + " product(s). " +
                "Please remove all products first.");
        }
        if (enterprise.getTransactions() != null && !enterprise.getTransactions().isEmpty()) {
            throw new IllegalArgumentException(
                "Cannot delete enterprise '" + enterprise.getName() + 
                "' because it has " + enterprise.getTransactions().size() + " transaction(s). " +
                "Cannot delete enterprise with transaction history.");
        }

        enterpriseRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Enterprise deleted successfully")
                .build();
    }

    @Override
    public Response getEnterpriseStats(Long id) {
        User currentUser = userService.getCurrentLoggedInUser();

        Enterprise enterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        validateEnterpriseAccess(currentUser, enterprise);

        EnterpriseDTO enterpriseDTO = mapToDTOWithStats(enterprise);

        return Response.builder()
                .status(200)
                .message("success")
                .enterprise(enterpriseDTO)
                .build();
    }

    @Override
    public Response getMyEnterprise() {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException(
                "SUPER_ADMIN is not associated with a specific enterprise. " +
                "Use /api/enterprises/all to view all enterprises.");
        }

        return getEnterpriseById(currentUser.getEnterprise().getId());
    }

    @Override
    public Response getMyEnterpriseStats() {
        User currentUser = userService.getCurrentLoggedInUser();

        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            throw new InvalidCredentialsException(
                "SUPER_ADMIN is not associated with a specific enterprise. " +
                "Use /api/enterprises/{id}/stats to view specific enterprise stats.");
        }

        return getEnterpriseStats(currentUser.getEnterprise().getId());
    }

    private void validateEnterpriseAccess(User currentUser, Enterprise enterprise) {
        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }

        if (!currentUser.getEnterprise().getId().equals(enterprise.getId())) {
            throw new InvalidCredentialsException(
                "You can only access information about your own enterprise");
        }
    }

    private EnterpriseDTO mapToDTO(Enterprise enterprise) {
        EnterpriseDTO dto = new EnterpriseDTO();
        dto.setId(enterprise.getId());
        dto.setName(enterprise.getName());
        dto.setAddress(enterprise.getAddress());
        dto.setEmail(enterprise.getEmail());
        dto.setCreatedAt(enterprise.getCreatedAt());
        return dto;
    }

    private EnterpriseDTO mapToDTOWithStats(Enterprise enterprise) {
        EnterpriseDTO dto = mapToDTO(enterprise);

        if (enterprise.getUsers() != null) {
            dto.setTotalUsers(enterprise.getUsers().size());
        }
        if (enterprise.getProducts() != null) {
            dto.setTotalProducts(enterprise.getProducts().size());
        }
        if (enterprise.getCategories() != null) {
            dto.setTotalCategories(enterprise.getCategories().size());
        }
        if (enterprise.getPartners() != null) {
            dto.setTotalPartners(enterprise.getPartners().size());
        }
        if (enterprise.getTransactions() != null) {
            dto.setTotalTransactions(enterprise.getTransactions().size());
        }
        
        return dto;
    }
}