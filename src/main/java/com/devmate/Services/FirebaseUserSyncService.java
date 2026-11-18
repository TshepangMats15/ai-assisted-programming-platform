
package com.devmate.Services;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;

import com.google.firebase.auth.ExportedUserRecord;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.UserRecord;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class FirebaseUserSyncService {

    private final UserRepository userRepository;

    public FirebaseUserSyncService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    public enum SyncStatus {
        CREATED,
        ALREADY_EXISTS,
        MISSING_EMAIL,
        EMAIL_CONFLICT,
        DISABLED
    }

    // SYNCHRONIZE ONE USER USING THEIR FIREBASE UID
    public SyncStatus syncUserByUid(String firebaseUid)
            throws FirebaseAuthException {

        UserRecord firebaseUser =
                FirebaseAuth.getInstance()
                        .getUser(firebaseUid);

        return syncFirebaseUser(firebaseUser);
    }

    // SYNCHRONIZE A FIREBASE USER WITH MYSQL
    private SyncStatus syncFirebaseUser(
            UserRecord firebaseUser
    ) {

        String firebaseUid = firebaseUser.getUid();
        String email = firebaseUser.getEmail();
        String displayName = firebaseUser.getDisplayName();

        // Do not import disabled Firebase accounts.
        if (firebaseUser.isDisabled()) {
            return SyncStatus.DISABLED;
        }

        // Preserve existing users, SQL IDs and roles.
        if (userRepository.findByFirebaseUid(firebaseUid)
                .isPresent()) {

            return SyncStatus.ALREADY_EXISTS;
        }

        // Email is mandatory in the current Users entity.
        if (email == null || email.isBlank()) {
            return SyncStatus.MISSING_EMAIL;
        }

        // Prevent linking an email to the wrong Firebase UID.
        if (userRepository.existsByEmail(email)) {
            return SyncStatus.EMAIL_CONFLICT;
        }

        Users user = new Users();

        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);

        user.setFullName(
                displayName != null && !displayName.isBlank()
                        ? displayName
                        : email
        );

        // Newly imported users receive the STUDENT role.
        user.setRole(Users.Role.STUDENT.name());

        // Firebase handles authentication and passwords.
        user.setPassword(null);

        // Importing does not indicate current activity.
        user.setLastActive(null);

        try {
            userRepository.saveAndFlush(user);

            return SyncStatus.CREATED;

        } catch (DataIntegrityViolationException e) {

            // Handle concurrent synchronization requests.
            if (userRepository.findByFirebaseUid(firebaseUid)
                    .isPresent()) {

                return SyncStatus.ALREADY_EXISTS;
            }

            if (userRepository.existsByEmail(email)) {
                return SyncStatus.EMAIL_CONFLICT;
            }

            throw e;
        }
    }

    // BULK IMPORT ALL EXISTING FIREBASE USERS
    public SyncSummary syncAllFirebaseUsers()
            throws FirebaseAuthException {

        int total = 0;
        int imported = 0;
        int alreadyExists = 0;
        int missingEmail = 0;
        int emailConflicts = 0;
        int disabled = 0;

        ListUsersPage page =
                FirebaseAuth.getInstance()
                        .listUsers(null);

        // iterateAll automatically handles Firebase pagination.
        for (ExportedUserRecord firebaseUser :
                page.iterateAll()) {

            total++;

            SyncStatus status =
                    syncFirebaseUser(firebaseUser);

            switch (status) {
                case CREATED -> imported++;
                case ALREADY_EXISTS -> alreadyExists++;
                case MISSING_EMAIL -> missingEmail++;
                case EMAIL_CONFLICT -> emailConflicts++;
                case DISABLED -> disabled++;
            }
        }

        return new SyncSummary(
                total,
                imported,
                alreadyExists,
                missingEmail,
                emailConflicts,
                disabled
        );
    }

    // BULK SYNCHRONIZATION SUMMARY
    public record SyncSummary(
            int total,
            int imported,
            int alreadyExists,
            int missingEmail,
            int emailConflicts,
            int disabled
    ) {
    }
}

