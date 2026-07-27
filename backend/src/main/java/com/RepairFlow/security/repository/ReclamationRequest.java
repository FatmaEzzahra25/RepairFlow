package com.RepairFlow.security.repository;

import lombok.Data;

@Data
public class ReclamationRequest {
    private Long produitId;
    private String description;
}