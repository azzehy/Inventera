package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.EnterpriseDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.services.EnterpriseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;

    @Override
    public Response createEnterprise(EnterpriseDTO enterpriseDTO) {
        
        Enterprise enterprise = Enterprise.builder()
                .name(enterpriseDTO.getName())
                .address(enterpriseDTO.getAddress())
                .email(enterpriseDTO.getEmail())
                .build();

        enterpriseRepository.save(enterprise);

        return Response.builder()
                .status(200)
                .message("Enterprise created successfully")
                .build();
    }

    @Override
    public Response updateEnterprise(Long id, EnterpriseDTO enterpriseDTO) {
        
        Enterprise existingEnterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        if (enterpriseDTO.getName() != null && !enterpriseDTO.getName().isBlank()) {
            existingEnterprise.setName(enterpriseDTO.getName());
        }

        if (enterpriseDTO.getAddress() != null) {
            existingEnterprise.setAddress(enterpriseDTO.getAddress());
        }

        if (enterpriseDTO.getEmail() != null && !enterpriseDTO.getEmail().isBlank()) {
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
        
        Enterprise enterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        EnterpriseDTO enterpriseDTO = mapToDTO(enterprise);

        return Response.builder()
                .status(200)
                .message("success")
                .enterprise(enterpriseDTO)
                .build();
    }

    @Override
    public Response deleteEnterprise(Long id) {
        
        enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        enterpriseRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Enterprise deleted successfully")
                .build();
    }

    @Override
    public Response getEnterpriseStats(Long id) {
        
        Enterprise enterprise = enterpriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        EnterpriseDTO enterpriseDTO = mapToDTOWithStats(enterprise);

        return Response.builder()
                .status(200)
                .message("success")
                .enterprise(enterpriseDTO)
                .build();
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