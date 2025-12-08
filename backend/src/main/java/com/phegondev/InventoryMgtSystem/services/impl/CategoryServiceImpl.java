package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.CategoryDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.InvalidCredentialsException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Category;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.models.User;
import com.phegondev.InventoryMgtSystem.repositories.CategoryRepository;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.services.CategoryService;
import com.phegondev.InventoryMgtSystem.services.UserService;
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
public class CategoryServiceImpl implements CategoryService {

        private final CategoryRepository categoryRepository;
        private final EnterpriseRepository enterpriseRepository;
        private final UserService userService;

        @Override
        @Transactional
        public Response createCategory(CategoryDTO categoryDTO) {
                User currentUser = userService.getCurrentLoggedInUser();

                Enterprise enterprise = enterpriseRepository.findById(categoryDTO.getEnterpriseId())
                                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

                if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                        if (!currentUser.getEnterprise().getId().equals(categoryDTO.getEnterpriseId())) {
                                throw new InvalidCredentialsException(
                                                "You can only create categories for your own enterprise");
                        }
                }
                if (categoryRepository.existsByNameAndEnterpriseId(categoryDTO.getName(), enterprise.getId())) {
                        throw new IllegalArgumentException(
                                        "A category with the name '" + categoryDTO.getName() +
                                                        "' already exists in this enterprise");
                }

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
                User currentUser = userService.getCurrentLoggedInUser();

                if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                        throw new InvalidCredentialsException("Only SUPER_ADMIN can view all categories");
                }

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
                User currentUser = userService.getCurrentLoggedInUser();

                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Category Not Found"));

                validateCategoryAccess(currentUser, category);

                CategoryDTO categoryDTO = mapToDTO(category);

                return Response.builder()
                                .status(200)
                                .message("success")
                                .category(categoryDTO)
                                .build();
        }

        @Override
        @Transactional
        public Response updateCategory(Long id, CategoryDTO categoryDTO) {
                User currentUser = userService.getCurrentLoggedInUser();

                Category existingCategory = categoryRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Category Not Found"));

                validateCategoryAccess(currentUser, existingCategory);

                if (categoryDTO.getName() != null && !categoryDTO.getName().isBlank()
                                && !categoryDTO.getName().equals(existingCategory.getName())) {
                        if (categoryRepository.existsByNameAndEnterpriseId(
                                        categoryDTO.getName(), existingCategory.getEnterprise().getId())) {
                                throw new IllegalArgumentException(
                                                "A category with the name '" + categoryDTO.getName() +
                                                                "' already exists in this enterprise");
                        }
                        existingCategory.setName(categoryDTO.getName());
                }

                if (categoryDTO.getEnterpriseId() != null &&
                                !categoryDTO.getEnterpriseId().equals(existingCategory.getEnterprise().getId())) {

                        if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                                throw new InvalidCredentialsException(
                                                "Only SUPER_ADMIN can change a category's enterprise");
                        }

                        Enterprise enterprise = enterpriseRepository.findById(categoryDTO.getEnterpriseId())
                                        .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

                        if (categoryRepository.existsByNameAndEnterpriseId(
                                        existingCategory.getName(), enterprise.getId())) {
                                throw new IllegalArgumentException(
                                                "A category with the name '" + existingCategory.getName() +
                                                                "' already exists in the target enterprise");
                        }

                        existingCategory.setEnterprise(enterprise);
                }

                categoryRepository.save(existingCategory);

                return Response.builder()
                                .status(200)
                                .message("Category Was Successfully Updated")
                                .build();
        }

        @Override
        @Transactional
        public Response deleteCategory(Long id) {
                User currentUser = userService.getCurrentLoggedInUser();

                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Category Not Found"));

                validateCategoryAccess(currentUser, category);

                if (category.getProducts() != null && !category.getProducts().isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Cannot delete category '" + category.getName() +
                                                        "' because it has " + category.getProducts().size()
                                                        + " product(s) associated with it. " +
                                                        "Please reassign or delete the products first.");
                }

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
                User currentUser = userService.getCurrentLoggedInUser();

                enterpriseRepository.findById(enterpriseId)
                                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

                if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                        if (!currentUser.getEnterprise().getId().equals(enterpriseId)) {
                                throw new InvalidCredentialsException(
                                                "You can only view categories from your own enterprise");
                        }
                }
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

        @Override
        public Response getMyEnterpriseCategories() {
                User currentUser = userService.getCurrentLoggedInUser();

                if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
                        throw new InvalidCredentialsException(
                                        "SUPER_ADMIN is not associated with a specific enterprise. " +
                                                        "Use /api/categories/all to view all categories or " +
                                                        "/api/categories/enterprise/{id} for a specific enterprise.");
                }

                return getCategoriesByEnterprise(currentUser.getEnterprise().getId());
        }

        private void validateCategoryAccess(User currentUser, Category category) {
                if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
                        return;
                }

                if (!category.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
                        throw new InvalidCredentialsException(
                                        "You can only access categories from your own enterprise");
                }
        }

}