package com.aftersales.controller;

import com.aftersales.dto.ApiResponse;
import com.aftersales.entity.SparePart;
import com.aftersales.repository.SparePartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/parts")
@RequiredArgsConstructor
@Slf4j
public class SparePartController {

    private final SparePartRepository sparePartRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SparePart>>> getAllParts() {
        log.debug("GET /parts");
        List<SparePart> parts = sparePartRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(parts));
    }
}
