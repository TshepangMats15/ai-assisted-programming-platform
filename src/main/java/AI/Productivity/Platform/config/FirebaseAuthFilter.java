package AI.Productivity.Platform.config;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("--- 1. FILTER INTERCEPTED REQUEST TO: " + path + " ---");

        if (path.startsWith("/api/auth/verify")) {
            System.out.println("--- 2. ALLOWING PUBLIC AUTH ENDPOINT ---");
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println("--- 3. AUTHORIZATION HEADER READ: " + header + " ---");

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("--- 4. FAILED AT HEADER CHECK ---");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String token = header.substring(7);
        System.out.println("--- 5. TOKEN EXTRACTED: " + token.substring(0, 15) + "... ---");

        FirebaseToken decodedToken;
        try {
            System.out.println("--- 6. CONTACTING FIREBASE ---");
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            System.out.println("--- 7. FIREBASE SUCCESS! UID: " + decodedToken.getUid() + " ---");
        } catch (Exception e) {
            System.out.println("--- 8. FIREBASE REJECTED THE TOKEN ---");
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase token");
            return;
        }

        request.setAttribute("uid", decodedToken.getUid());
        System.out.println("--- 9. PASSING TO CONTROLLER ---");
        filterChain.doFilter(request, response);
    }
}