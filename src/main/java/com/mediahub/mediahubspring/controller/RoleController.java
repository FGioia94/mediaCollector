package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.RoleRequest;
import com.mediahub.mediahubspring.dto.RoleResponse;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleService service;

    public RoleController(RoleService service) {
        this.service = service;
    }

    @PostMapping
    public RoleResponse add(@Valid @RequestBody RoleRequest request) {
        Role role = new Role();
        role.setName(request.getName());

        Role saved = service.addRole(role);
        return toResponse(saved);
    }

    @GetMapping("/all")
    public List<RoleResponse> getAll() {
        return service.getAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public RoleResponse get(@PathVariable Long id) {
        return toResponse(service.get(id));
    }

    @PutMapping("/{id}")
    public RoleResponse update(@PathVariable Long id, @Valid @RequestBody RoleRequest request) {
        Role updates = new Role();
        updates.setName(request.getName());

        Role updated = service.update(id, updates);
        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getCreatedAt()
        );
    }
}
