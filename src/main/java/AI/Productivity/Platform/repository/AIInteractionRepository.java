package AI.Productivity.Platform.repository;

import AI.Productivity.Platform.entity.AIInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIInteractionRepository extends JpaRepository<AIInteraction, Long> {
}
