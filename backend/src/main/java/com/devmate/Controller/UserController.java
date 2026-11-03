package com.devmate.Controller;

import com.devmate.Entities.Users;
import com.devmate.Services.UserServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserServices userServices;

    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }

    // CREATE USER
    @PostMapping
    public ResponseEntity<Users> createUser(@RequestBody Users user) {
        Users createdUser = userServices.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // GET ALL USERS
    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userServices.getAllUsers());
    }

    // GET ACTIVE USERS (admin screen)
    @GetMapping("/active")
    public ResponseEntity<List<Users>> getActiveUsers() {
        return ResponseEntity.ok(userServices.getActiveUsers());
    }

    // GET USER BY ID
    @GetMapping("/{userID}")
    public ResponseEntity<Users> getUserById(@PathVariable String userID) {
        return ResponseEntity.ok(userServices.getUserById(userID));
    }

    // UPDATE USER
    @PutMapping("/{userID}")
    public ResponseEntity<Users> updateUser(
            @PathVariable String userID,
            @RequestBody Users user) {
        return ResponseEntity.ok(userServices.updateUser(userID, user));
    }

    // HEARTBEAT (student app calls this every minute)
    @PutMapping("/{userID}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable String userID) {
        return userServices.markActive(userID)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // DELETE USER
    @DeleteMapping("/{userID}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userID) {
        userServices.deleteUser(userID);
        return ResponseEntity.noContent().build();
    }
}