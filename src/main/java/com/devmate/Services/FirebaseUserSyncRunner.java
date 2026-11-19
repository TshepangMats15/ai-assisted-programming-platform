
package com.devmate.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "firebase.sync.enabled",
        havingValue = "true",
        matchIfMissing = false
)
public class FirebaseUserSyncRunner
        implements ApplicationRunner {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    FirebaseUserSyncRunner.class
            );

    private final FirebaseUserSyncService syncService;

    public FirebaseUserSyncRunner(
            FirebaseUserSyncService syncService
    ) {
        this.syncService = syncService;
    }

    @Override
    public void run(ApplicationArguments args) {

        logger.info(
                "Starting Firebase user synchronization..."
        );

        try {

            FirebaseUserSyncService.SyncSummary summary =
                    syncService.syncAllFirebaseUsers();

            logger.info(
                    "Firebase user synchronization completed."
            );

            logger.info("Total users: {}", summary.total());
            logger.info("Imported: {}", summary.imported());
            logger.info(
                    "Already exists: {}",
                    summary.alreadyExists()
            );
            logger.info(
                    "Missing email: {}",
                    summary.missingEmail()
            );
            logger.info(
                    "Email conflicts: {}",
                    summary.emailConflicts()
            );
            logger.info(
                    "Disabled accounts: {}",
                    summary.disabled()
            );

        } catch (Exception e) {

            logger.error(
                    "Firebase user synchronization failed.",
                    e
            );
        }
    }
}

