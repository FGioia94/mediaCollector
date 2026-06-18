package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public class UserRolesRequest {

    @NotEmpty(message = "At least one role id is required")
    private Set<Long> roleIds;

    public UserRolesRequest() {
    }

    public UserRolesRequest(Set<Long> roleIds) {
        this.roleIds = roleIds;
    }

    public Set<Long> getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(Set<Long> roleIds) {
        this.roleIds = roleIds;
    }
}