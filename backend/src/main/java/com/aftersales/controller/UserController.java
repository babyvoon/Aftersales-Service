package com.aftersales.controller;

import com.aftersales.dto.ApiResponse;
import com.aftersales.entity.User;
import com.aftersales.enums.UserRole;
import com.aftersales.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/mechanics")
    public ResponseEntity<ApiResponse<List<User>>> getMechanics() {
        log.debug("GET /users/mechanics");
        List<User> mechanics = userRepository.findByRole(UserRole.MECHANIC);
        return ResponseEntity.ok(ApiResponse.success(mechanics));
    }
}
