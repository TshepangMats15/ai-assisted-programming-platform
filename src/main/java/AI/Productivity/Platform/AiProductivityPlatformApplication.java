
package AI.Productivity.Platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication(scanBasePackages = {
        "AI.Productivity.Platform",
        "com.devmate"
})
@EntityScan(basePackages = {
        "AI.Productivity.Platform.entity",
        "com.devmate.Entities"
})
@EnableJpaRepositories(basePackages = {
        "AI.Productivity.Platform.repository",
        "com.devmate.Repository"
})
@RestController
public class AiProductivityPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                AiProductivityPlatformApplication.class,
                args
        );
    }

    @GetMapping("/hello")
    public String hello() {
        return "DevMate Backend is running!";
    }
}
