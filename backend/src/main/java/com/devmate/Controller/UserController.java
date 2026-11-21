
package com.devmate.Controller;

import com.devmate.Entities.Users;
import com.devmate.Services.UserServices;
import com.devmate.Services.FirebaseUserSyncService;

import com.google.firebase.auth.FirebaseAuthException;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserServices userServices;
    private final FirebaseUserSyncService firebaseUserSyncService;

    public UserController(
            UserServices userServices,
            FirebaseUserSyncService firebaseUserSyncService
    ) {
        this.userServices = userServices;
        this.firebaseUserSyncService = firebaseUserSyncService;
    }

    // SYNC FIREBASE USER WITH MYSQL
    @PostMapping("/sync")
    public ResponseEntity<Void> syncUser(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String firebaseUid
    ) {

        requireAuthenticatedUid(firebaseUid);

        try {

            FirebaseUserSyncService.SyncStatus status =
                    firebaseUserSyncService.syncUserByUid(firebaseUid);

            return switch (status) {

                case CREATED -> ResponseEntity
                        .status(HttpStatus.CREATED)
                        .build();

                case ALREADY_EXISTS -> ResponseEntity
                        .ok()
                        .build();

                case MISSING_EMAIL -> ResponseEntity
                        .badRequest()
                        .build();

                case EMAIL_CONFLICT -> ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .build();

                case DISABLED -> ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            };

        } catch (FirebaseAuthException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to retrieve Firebase user.",
                    e
            );
        }
    }

    // ADMIN: GET ALL USERS
    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers(
            HttpServletRequest request
    ) {

        requireAdmin(request);

        return ResponseEntity.ok(
                userServices.getAllUsers()
        );
    }

    // ADMIN: GET ACTIVE USERS
    @GetMapping("/active")
    public ResponseEntity<List<Users>> getActiveUsers(
            HttpServletRequest request
    ) {

        requireAdmin(request);

        return ResponseEntity.ok(
                userServices.getActiveUsers()
        );
    }

    // GET CURRENT AUTHENTICATED USER
    @GetMapping("/me")
    public ResponseEntity<Users> getCurrentUser(
            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String firebaseUid
    ) {

        requireAuthenticatedUid(firebaseUid);

        return ResponseEntity.ok(
                userServices.getUserById(firebaseUid)
        );
    }

    // GET USER BY FIREBASE UID
    @GetMapping("/{userID}")
    public ResponseEntity<Users> getUserById(
            @PathVariable String userID,

            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String firebaseUid,

            HttpServletRequest request
    ) {

        requireAuthenticatedUid(firebaseUid);

        boolean isOwner = firebaseUid.equals(userID);
        boolean isAdmin = request.isUserInRole("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access another user's profile."
            );
        }

        return ResponseEntity.ok(
                userServices.getUserById(userID)
        );
    }

    // ADMIN: UPDATE USER
    @PutMapping("/{userID}")
    public ResponseEntity<Users> updateUser(
            @PathVariable String userID,
            @RequestBody Users user,
            HttpServletRequest request
    ) {

        requireAdmin(request);

        Users updatedUser = userServices.updateUser(
                userID,
                user
        );

        return ResponseEntity.ok(updatedUser);
    }

    // UPDATE OWN USER ACTIVITY
    @PutMapping("/{userID}/heartbeat")
    public ResponseEntity<Void> heartbeat(
            @PathVariable String userID,

            @RequestAttribute(
                    value = "uid",
                    required = false
            ) String firebaseUid
    ) {

        requireAuthenticatedUid(firebaseUid);

        if (!firebaseUid.equals(userID)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot update another user's activity."
            );
        }

        boolean updated = userServices.markActive(firebaseUid);

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // ADMIN: DELETE USER
    @DeleteMapping("/{userID}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String userID,
            HttpServletRequest request
    ) {

        requireAdmin(request);

        userServices.deleteUser(userID);

        return ResponseEntity.noContent().build();
    }

    // AUTHENTICATION HELPER
    private void requireAuthenticatedUid(String firebaseUid) {

        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }
    }

    // ADMIN AUTHORIZATION HELPER
    private void requireAdmin(HttpServletRequest request) {

        if (request.getUserPrincipal() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        if (!request.isUserInRole("ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access required."
            );
        }
    }
}
