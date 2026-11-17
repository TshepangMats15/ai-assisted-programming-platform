
package com.devmate.Controller;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;
import com.devmate.Services.UserServices;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserServices userServices;
    private final UserRepository userRepository;

    public UserController(
            UserServices userServices,
            UserRepository userRepository
    ) {
        this.userServices = userServices;
        this.userRepository = userRepository;
    }

    // CREATE USER
    @PostMapping
    public ResponseEntity<Users> createUser(
            @RequestBody Users user
    ) {
        Users createdUser = userServices.createUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdUser);
    }

    // SYNC FIREBASE USER WITH MYSQL
    @PostMapping("/sync")
    public ResponseEntity<Void> syncUser(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String firebaseUid
    ) {

        // The UID must come from FirebaseAuthFilter,
        // after successful Firebase token verification.
        if (firebaseUid == null || firebaseUid.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        // Existing users remain unchanged.
        if (userRepository.findByFirebaseUid(firebaseUid)
                .isPresent()) {
            return ResponseEntity.ok().build();
        }

        // Create the missing SQL user.
        Users user = new Users();
        user.setFirebaseUid(firebaseUid);

        // Do not assign administrator privileges.
        // Other required user fields must be populated
        // according to the Users entity and database schema.

        userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    // GET ALL USERS
    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(
                userServices.getAllUsers()
        );
    }

    // GET ACTIVE USERS (ADMIN SCREEN)
    @GetMapping("/active")
    public ResponseEntity<List<Users>> getActiveUsers() {
        return ResponseEntity.ok(
                userServices.getActiveUsers()
        );
    }

    // GET USER BY ID
    @GetMapping("/{userID}")
    public ResponseEntity<Users> getUserById(
            @PathVariable String userID
    ) {
        return ResponseEntity.ok(
                userServices.getUserById(userID)
        );
    }

    // UPDATE USER
    @PutMapping("/{userID}")
    public ResponseEntity<Users> updateUser(
            @PathVariable String userID,
            @RequestBody Users user
    ) {
        return ResponseEntity.ok(
                userServices.updateUser(userID, user)
        );
    }

    // HEARTBEAT
    @PutMapping("/{userID}/heartbeat")
    public ResponseEntity<Void> heartbeat(
            @PathVariable String userID
    ) {
        return userServices.markActive(userID)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // DELETE USER
    @DeleteMapping("/{userID}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String userID
    ) {
        userServices.deleteUser(userID);

        return ResponseEntity.noContent().build();
    }
}
