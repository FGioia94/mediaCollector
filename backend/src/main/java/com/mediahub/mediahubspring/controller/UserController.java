package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.UserRolesRequest;
import com.mediahub.mediahubspring.dto.UserRequest;
import com.mediahub.mediahubspring.dto.UserResponse;
import com.mediahub.mediahubspring.dto.ProfileImageUpdateRequest;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.RoleService;
import com.mediahub.mediahubspring.service.UserService;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService service;
    private final RoleService roleService;
    private final String systemAdminEmail;

    public UserController(UserService service,
                          RoleService roleService,
                          @Value("${app.admin-bootstrap.email:}") String systemAdminEmail) {
        this.service = service;
        this.roleService = roleService;
        this.systemAdminEmail = systemAdminEmail;
    }

    @PostMapping("/add")
    public UserResponse addUser(@Valid @RequestBody UserRequest request) {
        User created = new User();
        created.setFirstName(request.getFirstName());
        created.setLastName(request.getLastName());
        created.setEmail(request.getEmail());
        created.setPassword(request.getPassword());
        created.setProfileImage(request.getProfileImage());
        User saved = service.addUser(created);
        return new UserResponse(
                saved.getId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail(),
                isSystemAdmin(saved),
            saved.getProfileImage(),
                saved.getRoles(),
                saved.getCreatedAt());
    }

    @GetMapping("/all")
    public List<UserResponse> getAll() {
        return service.getAll().
                stream().
                map(user -> new UserResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        isSystemAdmin(user),
                        user.getProfileImage(),
                        user.getRoles(),
                        user.getCreatedAt())).
                toList();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        User user = service.get(id);
        return toResponse(user);
    }

    @GetMapping("/me")
    public UserResponse getMe(Authentication authentication) {
        User user = service.getByEmail(authentication.getName());
        return toResponse(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        User existing = service.get(id);
        if (isSystemAdmin(existing)) {
            throw new ResponseStatusException(FORBIDDEN, "System admin account cannot be deleted");
        }
        service.delete(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {

        User existing = service.get(id);
        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPassword(request.getPassword());
        existing.setProfileImage(request.getProfileImage());

        User updated = service.update(id, existing);
        return toResponse(updated);
    }

    @PutMapping({"/me/profile-image", "/me/profile-image/"})
    public UserResponse updateMyProfileImage(Authentication authentication,
                                             @Valid @RequestBody ProfileImageUpdateRequest request) {
        User user = service.getByEmail(authentication.getName());
        User updated = service.updateProfileImage(user.getId(), request.getProfileImage());
        return toResponse(updated);
    }

    @PutMapping("/{id}/roles")
    public UserResponse assignRoles(@PathVariable Long id, @Valid @RequestBody UserRolesRequest request) {
        User existing = service.get(id);
        if (isSystemAdmin(existing)) {
            throw new ResponseStatusException(FORBIDDEN, "System admin roles cannot be changed");
        }

        // Replace the full role set with the provided role ids.
        Set<Role> roles = request.getRoleIds()
                .stream()
                .map(roleService::get)
                .collect(Collectors.toSet());

        existing.setRoles(roles);
        User updated = service.update(id, existing);

        return toResponse(updated);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                isSystemAdmin(user),
                user.getProfileImage(),
                user.getRoles(),
                user.getCreatedAt());
    }

    private boolean isSystemAdmin(User user) {
        if (systemAdminEmail == null || systemAdminEmail.isBlank()) {
            return false;
        }
        return EmailNormalizer.normalize(systemAdminEmail)
                .equals(EmailNormalizer.normalize(user.getEmail()));
    }

}
