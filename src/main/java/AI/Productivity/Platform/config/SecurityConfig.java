
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

            // Preserve existing CORS configuration.
            .cors(Customizer.withDefaults())

            // Stateless REST API.
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Disable default authentication mechanisms.
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            // Return 401 for unauthenticated requests.
            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(
                    new HttpStatusEntryPoint(
                        HttpStatus.UNAUTHORIZED
                    )
                )
            )

            // Verify Firebase ID tokens.
            .addFilterBefore(
                firebaseAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests.
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // Public health and error endpoints.
                .requestMatchers(
                    "/actuator/health",
                    "/error"
                ).permitAll()

                // Synchronize authenticated Firebase users.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/users/sync"
                ).authenticated()

                // Only administrators can list users.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users",
                    "/api/users/active"
                ).hasRole("ADMIN")

                // User profile access.
                // Ownership is checked in UserController.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users/*"
                ).authenticated()

                // User activity heartbeat.
                // Ownership is checked in UserController.
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/users/*/heartbeat"
                ).authenticated()

                // Only administrators can update users.
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/users/*"
                ).hasRole("ADMIN")

                // Only administrators can delete users.
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/users/*"
                ).hasRole("ADMIN")

                // Deny all other user endpoints.
                .requestMatchers(
                    "/api/users",
                    "/api/users/**"
                ).denyAll()

                // Protect submissions.
                .requestMatchers(
                    "/api/submissions",
                    "/api/submissions/**"
                ).authenticated()

                // Protect assessment results.
                .requestMatchers(
                    "/api/results",
                    "/api/results/**"
                ).authenticated()

                // Preserve other existing endpoints.
                .anyRequest().permitAll()
            );

        return http.build();
    }

    // Prevent duplicate servlet filter registration.
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
