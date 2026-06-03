package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.repository.RoleRepository;

import java.util.List;
import java.util.Set;

public interface UserService {

    public User addUser(User user);

    public List<User> getAll();

    public User get(Long id);

    public void delete(Long id);

    public User update(Long id, User updates);

    public User getByEmail(String email);

}
