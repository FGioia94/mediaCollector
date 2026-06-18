package com.mediahub.mediahubspring.service;


import com.mediahub.mediahubspring.exception.RoleNotFoundException;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {
    private final RoleRepository repository;

    public RoleServiceImpl(RoleRepository repository) {
        this.repository = repository;
    }

    @Override
    public Role addRole(Role role) {
        return repository.save(role);
    }

    @Override
    public List<Role> getAll() {
        return repository.findAll();
    }

    @Override
    public Role get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RoleNotFoundException(id));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RoleNotFoundException(id);
        }
        repository.deleteById(id);
    }

    @Override
    public Role update(Long id, Role updates) {
        Role existing = repository.findById(id)
                .orElseThrow(() -> new RoleNotFoundException(id));
        if (updates.getName() != null) {
            existing.setName(updates.getName());
        }

        return repository.save(existing);
    }

    @Override
    public Role getByName(String name) {
        return repository.findByName(name)
                .orElseThrow(() -> new RoleNotFoundException(name));
    }

}
