package com.RepairFlow.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/demo-controller")

public class DemoController {
    @GetMapping
    public ResponseEntity<String> sayHelllo(){
        return ResponseEntity.ok("hello from secured endpoint");
    }

}
