
package com.devmate.Services;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class UserServices {

    private static final long ACTIVE_WINDOW_MINUTES = 5;

    private final UserRepository userRepository;

    public UserServices(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET ALL USERS
    @Transactional(readOnly = true)
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    // GET USER BY FIREBASE UID
    @Transactional(readOnly = true)
    public Users getUserById(String userID) {

        return userRepository.findByFirebaseUid(userID)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."
                        )
                );
    }

    // UPDATE APPLICATION USER PROFILE
    @Transactional
    public Users updateUser(
            String userID,
            Users updatedUser
    ) {

        if (updatedUser == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User details are required."
            );
        }

        Users existingUser = getUserById(userID);

        // Firebase manages authentication email.
        if (updatedUser.getEmail() != null
                && !updatedUser.getEmail().equals(
                        existingUser.getEmail()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email changes must be managed through Firebase."
            );
        }

        // Firebase manages passwords.
        if (updatedUser.getPassword() != null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password changes must be managed through Firebase."
            );
        }

        // Update application display name.
        if (updatedUser.getFullName() != null) {

            String fullName =
                    updatedUser.getFullName().trim();

            if (fullName.isEmpty()
                    || fullName.length() > 255) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Full name must contain 1 to 255 characters."
                );
            }

            existingUser.setFullName(fullName);
        }

        // Validate and update application role.
        if (updatedUser.getRole() != null) {

            String role = updatedUser.getRole()
                    .trim()
                    .toUpperCase(Locale.ROOT);

            if (!Users.Role.STUDENT.name().equals(role)
                    && !Users.Role.ADMIN.name().equals(role)) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Role must be STUDENT or ADMIN."
                );
            }

            existingUser.setRole(role);
        }

        return userRepository.save(existingUser);
    }

    // ACCOUNT DELETION
    public void deleteUser(String userID) {

        // Firebase and MySQL account lifecycle management
        // must be coordinated before enabling deletion.

        throw new ResponseStatusException(
                HttpStatus.NOT_IMPLEMENTED,
                "Account deletion is not currently enabled."
        );
    }

    // UPDATE USER ACTIVITY
    @Transactional
    public boolean markActive(String userID) {

        return userRepository.findByFirebaseUid(userID)
                .map(user -> {

                    user.setLastActive(
                            LocalDateTime.now()
                    );

                    userRepository.save(user);

                    return true;

                })
                .orElse(false);
    }

    // GET RECENTLY ACTIVE USERS
    @Transactional(readOnly = true)
    public List<Users> getActiveUsers() {

        LocalDateTime activeSince =
                LocalDateTime.now()
                        .minusMinutes(ACTIVE_WINDOW_MINUTES);

        return userRepository
                .findByLastActiveAfter(activeSince);
    }
}
