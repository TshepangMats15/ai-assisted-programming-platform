
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
            // Preserve existing CORS configuration.
            .cors(Customizer.withDefaults())

            // Stateless REST API.
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Verify Firebase tokens before authentication.
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

                // Require Firebase authentication for submissions.
                .requestMatchers(
                    "/api/submissions",
                    "/api/submissions/**"
                ).authenticated()

                // Require Firebase authentication for results.
                .requestMatchers(
                    "/api/results",
                    "/api/results/**"
                ).authenticated()

                // Preserve existing behavior for other endpoints.
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
