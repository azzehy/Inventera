package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.dtos.LoginRequest;
import com.phegondev.InventoryMgtSystem.dtos.RegisterRequest;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.dtos.UserDTO;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.InvalidCredentialsException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.models.User;
import com.phegondev.InventoryMgtSystem.repositories.EnterpriseRepository;
import com.phegondev.InventoryMgtSystem.repositories.UserRepository;
import com.phegondev.InventoryMgtSystem.security.JwtUtils;
import com.phegondev.InventoryMgtSystem.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.phegondev.InventoryMgtSystem.dtos.TransactionDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public Response registerUser(RegisterRequest registerRequest) {

        Enterprise enterprise = enterpriseRepository.findById(registerRequest.getEnterpriseId())
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        UserRole role = registerRequest.getRole() != null 
            ? registerRequest.getRole() 
            : UserRole.MANAGER;

        User userToSave = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(role)
                .enterprise(enterprise)
                .build();

        userRepository.save(userToSave);

        return Response.builder()
                .status(200)
                .message("User was successfully registered")
                .build();
    }

    @Override
    public Response loginUser(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new NotFoundException("Email Not Found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Password Does Not Match");
        }
        
        String token = jwtUtils.generateToken(user.getEmail());

        return Response.builder()
                .status(200)
                .message("User Logged in Successfully")
                .role(user.getRole())
                .token(token)
                .expirationTime("6 months")
                .build();
    }

    @Override
    public Response getAllUsers() {

        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<UserDTO> userDTOS = users.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .users(userDTOS)
                .build();
    }

    @Override
    public User getCurrentLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User Not Found"));

        return user;
    }

    @Override
    public Response getUserById(Long id) {

        User currentUser = getCurrentLoggedInUser();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User Not Found"));

        validateUserAccess(currentUser, user);

        UserDTO userDTO = mapToDTO(user);

        return Response.builder()
                .status(200)
                .message("success")
                .user(userDTO)
                .build();
    }

    @Override
    public Response updateUser(Long id, UserDTO userDTO) {
        User currentUser = getCurrentLoggedInUser();       
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User Not Found"));

        validateUserAccess(currentUser, existingUser);

        if (userDTO.getEmail() != null) {
            existingUser.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(userDTO.getPhoneNumber());
        }
        if (userDTO.getName() != null) {
            existingUser.setName(userDTO.getName());
        }
        if (userDTO.getRole() != null) {
            if (currentUser.getRole() != UserRole.SUPER_ADMIN && 
                currentUser.getRole() != UserRole.ADMIN) {
                throw new InvalidCredentialsException("You don't have permission to change roles");
            }
            if (currentUser.getRole() == UserRole.ADMIN && 
                userDTO.getRole() == UserRole.SUPER_ADMIN) {
                throw new InvalidCredentialsException("You cannot assign SUPER_ADMIN role");
            }
            existingUser.setRole(userDTO.getRole());
        }
        if (userDTO.getEnterpriseId() != null && 
            !userDTO.getEnterpriseId().equals(existingUser.getEnterprise().getId())) {
            if (currentUser.getRole() != UserRole.SUPER_ADMIN) {
                throw new InvalidCredentialsException("Only SUPER_ADMIN can change enterprise");
            }
            Enterprise enterprise = enterpriseRepository.findById(userDTO.getEnterpriseId())
                    .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));
            existingUser.setEnterprise(enterprise);
        }

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        userRepository.save(existingUser);

        return Response.builder()
                .status(200)
                .message("User successfully updated")
                .build();
    }

    @Override
    public Response deleteUser(Long id) {
        User currentUser = getCurrentLoggedInUser();
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User Not Found"));

        validateUserAccess(currentUser, userToDelete);

        if (currentUser.getId().equals(id)) {
            throw new InvalidCredentialsException("You cannot delete your own account");
        }

        if (currentUser.getRole() == UserRole.ADMIN && 
            (userToDelete.getRole() == UserRole.ADMIN || 
             userToDelete.getRole() == UserRole.SUPER_ADMIN)) {
            throw new InvalidCredentialsException("You cannot delete an admin account");
        }

        userRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("User successfully Deleted")
                .build();
    }

    @Override
    public Response getUserTransactions(Long id) {
        User currentUser = getCurrentLoggedInUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User Not Found"));
        validateUserAccess(currentUser, user);
        UserDTO userDTO = mapToDTOWithTransactions(user);

        if (userDTO.getTransactions() != null) {
            userDTO.getTransactions().forEach(transactionDTO -> {
                transactionDTO.setUser(null);
                transactionDTO.setPartner(null);
            });
        }

        return Response.builder()
                .status(200)
                .message("success")
                .user(userDTO)
                .build();
    }

    @Override
    public Response getUsersByEnterprise(Long enterpriseId) {
        User currentUser = getCurrentLoggedInUser();

        if (currentUser.getRole() == UserRole.ADMIN && 
            !currentUser.getEnterprise().getId().equals(enterpriseId)) {
            throw new InvalidCredentialsException("You can only view users from your enterprise");
        }
        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        List<User> users = userRepository.findByEnterpriseId(enterpriseId);

        List<UserDTO> userDTOS = users.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .users(userDTOS)
                .build();
    }

    @Override
    public Response getUsersByRole(UserRole role) {
        List<User> users = userRepository.findByRole(role);

        List<UserDTO> userDTOS = users.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .users(userDTOS)
                .build();
    }

    @Override
    public Response getUsersByEnterpriseAndRole(Long enterpriseId, UserRole role) {
        enterpriseRepository.findById(enterpriseId)
                .orElseThrow(() -> new NotFoundException("Enterprise Not Found"));

        List<User> users = userRepository.findByEnterpriseIdAndRole(enterpriseId, role);

        List<UserDTO> userDTOS = users.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .users(userDTOS)
                .build();
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setEnterpriseId(user.getEnterprise().getId());
        dto.setEnterpriseName(user.getEnterprise().getName());
        return dto;
    }

    private UserDTO mapToDTOWithTransactions(User user) {
        UserDTO dto = mapToDTO(user);
        
        if (user.getTransactions() != null && !user.getTransactions().isEmpty()) {
            List<TransactionDTO> transactionDTOs = 
                user.getTransactions().stream()
                    .map(transaction -> {
                        TransactionDTO transactionDTO = 
                            new TransactionDTO();
                        transactionDTO.setId(transaction.getId());
                        transactionDTO.setTotalPrice(transaction.getTotalPrice());
                        transactionDTO.setQtyProducts(transaction.getQtyProducts());
                        transactionDTO.setTransactionType(transaction.getTransactionType());
                        transactionDTO.setStatus(transaction.getStatus());
                        transactionDTO.setDescription(transaction.getDescription());
                        transactionDTO.setNote(transaction.getNote());
                        transactionDTO.setCreatedAt(transaction.getCreatedAt());
                        transactionDTO.setUpdatedAt(transaction.getUpdatedAt());
                        return transactionDTO;
                    })
                    .collect(Collectors.toList());
            dto.setTransactions(transactionDTOs);
        }
        
        return dto;
    }

    @Override
    public Response getCurrentUserDTO() {
        User currentUser = getCurrentLoggedInUser();
        UserDTO userDTO = mapToDTO(currentUser);

        return Response.builder()
                .status(200)
                .message("success")
                .user(userDTO)
                .build();
    }
    
    private void validateUserAccess(User currentUser, User targetUser) {
        if (currentUser.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }

        if (currentUser.getRole() == UserRole.ADMIN) {
            if (!currentUser.getEnterprise().getId().equals(targetUser.getEnterprise().getId())) {
                throw new InvalidCredentialsException("Access denied to this user");
            }
            return;
        }

        if (!currentUser.getId().equals(targetUser.getId())) {
            throw new InvalidCredentialsException("Access denied to this user");
        }
    }
}