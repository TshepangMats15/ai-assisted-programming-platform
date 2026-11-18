
package AI.Productivity.Platform.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final FirebaseAuthFilter firebaseAuthFilter;

    public SecurityConfig(
            FirebaseAuthFilter firebaseAuthFilter
    ) {
        this.firebaseAuthFilter = firebaseAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            .cors(Customizer.withDefaults())

            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(
                    new HttpStatusEntryPoint(
                        HttpStatus.UNAUTHORIZED
                    )
                )
            )

            .addFilterBefore(
                firebaseAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            .authorizeHttpRequests(auth -> auth

                // CORS PREFLIGHT
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // PUBLIC HEALTH ENDPOINTS
                .requestMatchers(
                    "/actuator/health",
                    "/error"
                ).permitAll()

                // FIREBASE ACCOUNT SYNCHRONIZATION
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/users/sync"
                ).authenticated()

                // ADMIN USER MANAGEMENT
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users",
                    "/api/users/active"
                ).hasRole("ADMIN")

                // USER PROFILE ACCESS
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users/*"
                ).authenticated()

                // USER HEARTBEAT
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/users/*/heartbeat"
                ).authenticated()

                // ADMIN USER UPDATES
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/users/*"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/users/*"
                ).hasRole("ADMIN")

                // DENY UNRECOGNIZED USER ENDPOINTS
                .requestMatchers(
                    "/api/users",
                    "/api/users/**"
                ).denyAll()

                // ADMIN ENDPOINTS
                .requestMatchers(
                    "/api/admin",
                    "/api/admin/**"
                ).hasRole("ADMIN")

                // HIDDEN QUESTION TEST CASES
                .requestMatchers(
                    "/api/test-cases",
                    "/api/test-cases/**",
                    "/api/question-test-cases",
                    "/api/question-test-cases/**",
                    "/api/questions/*/test-cases",
                    "/api/questions/*/test-cases/**",
                    "/api/assessments/*/test-cases"
                ).hasRole("ADMIN")

                // ALLOW AUTHENTICATED COURSEWORK READS
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/assessments",
                    "/api/assessments/**",
                    "/api/coursework",
                    "/api/coursework/**",
                    "/api/lessons",
                    "/api/lessons/**",
                    "/api/questions",
                    "/api/questions/**"
                ).hasAnyRole("STUDENT", "ADMIN")

                // ONLY ADMINS MAY MODIFY LEARNING CONTENT
                .requestMatchers(
                    "/api/assessments",
                    "/api/assessments/**",
                    "/api/coursework",
                    "/api/coursework/**",
                    "/api/lessons",
                    "/api/lessons/**",
                    "/api/questions",
                    "/api/questions/**"
                ).hasRole("ADMIN")

                // STUDENT SUBMISSION WORKFLOW
                // ANNOUNCEMENT READ ACCESS
.requestMatchers(
    HttpMethod.GET,
    "/api/announcements",
    "/api/announcements/**"
).hasAnyRole("STUDENT", "ADMIN")

// ONLY ADMINS MAY MODIFY ANNOUNCEMENTS
.requestMatchers(
    "/api/announcements",
    "/api/announcements/**"
).hasRole("ADMIN")

                .requestMatchers(
                    "/api/submissions",
                    "/api/submissions/**"
                ).hasRole("STUDENT")

                // STUDENT RESULTS
                .requestMatchers(
                    "/api/results",
                    "/api/results/**"
                ).hasRole("STUDENT")

                // REQUIRE AUTHENTICATION FOR OTHER ENDPOINTS
                .anyRequest().authenticated()
            );

        return http.build();
    }

    // PREVENT DUPLICATE FILTER REGISTRATION
    @Bean
    public FilterRegistrationBean<FirebaseAuthFilter>
            firebaseAuthFilterRegistration(
                    FirebaseAuthFilter filter
            ) {

        FilterRegistrationBean<FirebaseAuthFilter>
                registration =
                    new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);

        return registration;
    }
}
