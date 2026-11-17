
package com.devmate.Controller;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;
import com.devmate.Services.UserServices;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;

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
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorizationHeader
    ) throws FirebaseAuthException {

        // Require a Firebase ID token.
        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        String idToken = authorizationHeader
                .substring(7)
                .trim();

        if (idToken.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        // Verify the Firebase token.
        String firebaseUid;

        try {
            firebaseUid = FirebaseAuth.getInstance()
                    .verifyIdToken(idToken)
                    .getUid();

        } catch (FirebaseAuthException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        // Preserve existing SQL users and their roles.
        if (userRepository.findByFirebaseUid(firebaseUid)
                .isPresent()) {

            return ResponseEntity.ok().build();
        }

        // Retrieve the user's Firebase profile.
        UserRecord firebaseUser = FirebaseAuth.getInstance()
                .getUser(firebaseUid);

        String email = firebaseUser.getEmail();

        // Email is mandatory in the Users entity.
        if (email == null || email.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .build();
        }

        // Prevent duplicate email conflicts.
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .build();
        }

        // Create the MySQL user.
        Users user = new Users();

        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);

        String displayName = firebaseUser.getDisplayName();

        user.setFullName(
                displayName != null && !displayName.isBlank()
                        ? displayName
                        : email
        );

        // All newly synchronized users are students.
        user.setRole(Users.Role.STUDENT.name());

        // Firebase manages passwords.
        user.setPassword(null);

        // Optional activity timestamp.
        user.setLastActive(null);

        // The Users entity automatically generates UserID.
        userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    // GET ALL USERS
    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers() {

        List<Users> users = userServices.getAllUsers();

        return ResponseEntity.ok(users);
    }

    // GET ACTIVE USERS
    @GetMapping("/active")
    public ResponseEntity<List<Users>> getActiveUsers() {

        List<Users> users = userServices.getActiveUsers();

        return ResponseEntity.ok(users);
    }

    // GET USER BY ID
    @GetMapping("/{userID}")
    public ResponseEntity<Users> getUserById(
            @PathVariable String userID
    ) {

        Users user = userServices.getUserById(userID);

        return ResponseEntity.ok(user);
    }

    // UPDATE USER
    @PutMapping("/{userID}")
    public ResponseEntity<Users> updateUser(
            @PathVariable String userID,
            @RequestBody Users user
    ) {

        Users updatedUser = userServices.updateUser(
                userID,
                user
        );

        return ResponseEntity.ok(updatedUser);
    }

    // UPDATE USER ACTIVITY
    @PutMapping("/{userID}/heartbeat")
    public ResponseEntity<Void> heartbeat(
            @PathVariable String userID
    ) {

        boolean updated = userServices.markActive(userID);

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
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
