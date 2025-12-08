package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.CategoryDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Category;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.repositories.CategoryRepository;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.services.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

        private final CategoryRepository categoryRepository;
        private final EnterpriseRepository enterpriseRepository;

        @Override
        public Response createCategory(CategoryDTO categoryDTO) {

                Enterprise enterprise = enterpriseRepository.findById(categoryDTO.getEnterpriseId())
                                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

                Category categoryToSave = Category.builder()
                                .name(categoryDTO.getName())
                                .enterprise(enterprise)
                                .build();

                categoryRepository.save(categoryToSave);

                return Response.builder()
                                .status(200)
                                .message("Category Saved Successfully")
                                .build();
        }

        @Override
        public Response getAllCategories() {
                List<Category> categories = categoryRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

                List<CategoryDTO> categoryDTOList = categories.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());

                return Response.builder()
                                .status(200)
                                .message("success")
                                .categories(categoryDTOList)
                                .build();
        }

        @Override
        public Response getCategoryById(Long id) {
                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Category Not Found"));

                CategoryDTO categoryDTO = mapToDTO(category);

                return Response.builder()
                                .status(200)
                                .message("success")
                                .category(categoryDTO)
                                .build();
        }

        @Override
        public Response updateCategory(Long id, CategoryDTO categoryDTO) {
                Category existingCategory = categoryRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Category Not Found"));

                existingCategory.setName(categoryDTO.getName());

                // Optionnel : permettre de changer l'entreprise
                if (categoryDTO.getEnterpriseId() != null &&
                                !categoryDTO.getEnterpriseId().equals(existingCategory.getEnterprise().getId())) {
                        Enterprise enterprise = enterpriseRepository.findById(categoryDTO.getEnterpriseId())
                                        .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
                        existingCategory.setEnterprise(enterprise);
                }

                categoryRepository.save(existingCategory);

                return Response.builder()
                                .status(200)
                                .message("Category Was Successfully Updated")
                                .build();
        }

        @Override
        public Response deleteCategory(Long id) {
                categoryRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Category Not Found"));

                categoryRepository.deleteById(id);

                return Response.builder()
                                .status(200)
                                .message("Category Was Successfully Deleted")
                                .build();
        }

        private CategoryDTO mapToDTO(Category category) {
                CategoryDTO dto = new CategoryDTO();
                dto.setId(category.getId());
                dto.setName(category.getName());
                dto.setEnterpriseId(category.getEnterprise().getId());
                dto.setEnterpriseName(category.getEnterprise().getName());
                return dto;
        }

        @Override
        public Response getCategoriesByEnterprise(Long enterpriseId) {
                enterpriseRepository.findById(enterpriseId)
                                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

                List<Category> categories = categoryRepository.findByEnterpriseId(enterpriseId);

                List<CategoryDTO> categoryDTOList = categories.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());

                return Response.builder()
                                .status(200)
                                .message("success")
                                .categories(categoryDTOList)
                                .build();
        }
}