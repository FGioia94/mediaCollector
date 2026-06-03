package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.UserRolesRequest;
import com.mediahub.mediahubspring.dto.UserRequest;
import com.mediahub.mediahubspring.dto.UserResponse;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.RoleService;
import com.mediahub.mediahubspring.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService service;
    private final RoleService roleService;

    public UserController(UserService service, RoleService roleService) {
        this.service = service;
        this.roleService = roleService;
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
                        user.getProfileImage(),
                        user.getRoles(),
                        user.getCreatedAt())).
                toList();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        User user = service.get(id);
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getProfileImage(),
                user.getRoles(),
                user.getCreatedAt());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
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
        return new UserResponse(
                updated.getId(),
                updated.getFirstName(),
                updated.getLastName(),
                updated.getEmail(),
            updated.getProfileImage(),
                updated.getRoles(),
                updated.getCreatedAt());
    }

    @PutMapping("/{id}/roles")
    public UserResponse assignRoles(@PathVariable Long id, @Valid @RequestBody UserRolesRequest request) {
        User existing = service.get(id);

        // Replace the full role set with the provided role ids.
        Set<Role> roles = request.getRoleIds()
                .stream()
                .map(roleService::get)
                .collect(Collectors.toSet());

        existing.setRoles(roles);
        User updated = service.update(id, existing);

        return new UserResponse(
                updated.getId(),
                updated.getFirstName(),
                updated.getLastName(),
                updated.getEmail(),
                updated.getProfileImage(),
                updated.getRoles(),
                updated.getCreatedAt());
    }

}
