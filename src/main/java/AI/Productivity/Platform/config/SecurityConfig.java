
package AI.Productivity.Platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final FirebaseAuthFilter firebaseAuthFilter;

    public SecurityConfig(FirebaseAuthFilter firebaseAuthFilter) {
        this.firebaseAuthFilter = firebaseAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // Keep the existing CORS configuration.
            .cors(Customizer.withDefaults())

            // Stateless REST API: no CSRF sessions.
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Firebase token verification runs before Spring's
            // username/password authentication filter.
            .addFilterBefore(
                firebaseAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests.
                .requestMatchers(
                    HttpMethod.OPTIONS, "/**"
                ).permitAll()

                // Public health and error endpoints.
                .requestMatchers(
                    "/actuator/health",
                    "/error"
                ).permitAll()

                // Submission endpoints require a verified
                // Firebase user.
                .requestMatchers(
                    "/api/submissions",
                    "/api/submissions/**"
                ).authenticated()

                // Preserve the existing access behavior for
                // other endpoints until their authorization
                // requirements are reviewed.
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
