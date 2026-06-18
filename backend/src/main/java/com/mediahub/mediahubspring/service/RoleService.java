package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Role;

import java.util.List;

public interface RoleService {
    public Role addRole(Role role);

    public List<Role> getAll();

    public Role get(Long id);

    public void delete(Long id);

    public Role update(Long id, Role updates);

    public Role getByName(String name);

}
