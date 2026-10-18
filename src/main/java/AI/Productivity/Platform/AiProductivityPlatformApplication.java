package AI.Productivity.Platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"AI.Productivity.Platform", "com.devmate"})
@EntityScan(basePackages = {"AI.Productivity.Platform.entity", "com.devmate.Entities"})
@EnableJpaRepositories(basePackages = {"AI.Productivity.Platform.repository", "com.devmate.Repository"})
public class AiProductivityPlatformApplication {
	public static void main(String[] args) {
		SpringApplication.run(AiProductivityPlatformApplication.class, args);
	}
}