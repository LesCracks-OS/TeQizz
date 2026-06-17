package com.brandonkamga.teqizz.config;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.TagRepository;
import com.brandonkamga.teqizz.dto.importData.QuestionImportResponse;
import com.brandonkamga.teqizz.gaming.qcm.application.service.QcmQuestionImportApplicationService;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameTypeName;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Game;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameStatus;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionLevel;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionStatus;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameStatusRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameTypeRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionLevelRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionStatusRepository;
import com.brandonkamga.teqizz.iam.domain.model.vo.ProviderType;
import com.brandonkamga.teqizz.iam.domain.model.vo.RoleType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Provider;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Role;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.ProviderRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.RoleRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Data Initializer for seeding the database with initial data.
 * Seeds enumeration entities, categories, tags, and imports questions from JSON files.
 * Only runs when the database is empty.
 *
 * Questions are imported from JSON files in src/main/resources/data/questions/
 * - You can add as many JSON files as you want
 * - Each file should follow the QuestionImportRequest structure
 * - Files are organized by category/difficulty for easier management
 */
@Component
@Profile("!test") // Don't run in test profile
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final ProviderRepository providerRepository;
    private final GameStatusRepository gameStatusRepository;
    private final GameTypeRepository gameTypeRepository;
    private final QuestionLevelRepository questionLevelRepository;
    private final QuestionStatusRepository questionStatusRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QcmQuestionImportApplicationService questionImportService;

    public DataInitializer(
            RoleRepository roleRepository,
            ProviderRepository providerRepository,
            GameStatusRepository gameStatusRepository,
            GameTypeRepository gameTypeRepository,
            QuestionLevelRepository questionLevelRepository,
            QuestionStatusRepository questionStatusRepository,
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            GameRepository gameRepository,
            QuestionRepository questionRepository,
            UserJpaRepository userRepository,
            PasswordEncoder passwordEncoder,
            QcmQuestionImportApplicationService questionImportService) {
        this.roleRepository = roleRepository;
        this.providerRepository = providerRepository;
        this.gameStatusRepository = gameStatusRepository;
        this.gameTypeRepository = gameTypeRepository;
        this.questionLevelRepository = questionLevelRepository;
        this.questionStatusRepository = questionStatusRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.questionImportService = questionImportService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Initialize enumeration entities
        initRoles();
        initProviders();
        initGameStatuses();
        initGameTypes();
        initQuestionLevels();
        initQuestionStatuses();

        // Initialize seed data for the application
        initCategories();
        initTags();
        initGames();

        // Import questions from JSON files
        importQuestionsFromJsonFiles();

        // Initialize default admin user
        initAdminUser();
    }

    // ==================== Enumeration Initialization ====================

    private void initRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(RoleType.USER));
            roleRepository.save(new Role(RoleType.ADMIN));
        }
    }

    private void initProviders() {
        if (providerRepository.count() == 0) {
            providerRepository.save(new Provider(ProviderType.LOCAL));
            providerRepository.save(new Provider(ProviderType.GITHUB));
            providerRepository.save(new Provider(ProviderType.GOOGLE));
        }
    }

    private void initGameStatuses() {
        if (gameStatusRepository.count() == 0) {
            gameStatusRepository.save(GameStatus.builder()
                    .statusName(GameStatusType.IN_PROGRESS)
                    .description("Game session is currently in progress")
                    .build());
            gameStatusRepository.save(GameStatus.builder()
                    .statusName(GameStatusType.COMPLETED)
                    .description("Game session has been completed")
                    .build());
            gameStatusRepository.save(GameStatus.builder()
                    .statusName(GameStatusType.CANCELLED)
                    .description("Game session has been cancelled")
                    .build());
        }
    }

    private void initGameTypes() {
        if (gameTypeRepository.count() == 0) {
            gameTypeRepository.save(GameType.builder()
                    .typeName(GameTypeName.QCM)
                    .description("Multiple Choice Questions")
                    .build());
            gameTypeRepository.save(GameType.builder()
                    .typeName(GameTypeName.SMATCH)
                    .description("Matching questions")
                    .build());
            gameTypeRepository.save(GameType.builder()
                    .typeName(GameTypeName.TRUE_FALSE)
                    .description("True or False questions")
                    .build());
            gameTypeRepository.save(GameType.builder()
                    .typeName(GameTypeName.DRAG_DROP)
                    .description("Drag and Drop questions")
                    .build());
        }
    }

    private void initQuestionLevels() {
        if (questionLevelRepository.count() == 0) {
            questionLevelRepository.save(QuestionLevel.builder()
                    .levelName(QuestionLevelType.EASY)
                    .description("Easy difficulty level")
                    .build());
            questionLevelRepository.save(QuestionLevel.builder()
                    .levelName(QuestionLevelType.MEDIUM)
                    .description("Medium difficulty level")
                    .build());
            questionLevelRepository.save(QuestionLevel.builder()
                    .levelName(QuestionLevelType.HARD)
                    .description("Hard difficulty level")
                    .build());
            questionLevelRepository.save(QuestionLevel.builder()
                    .levelName(QuestionLevelType.EXPERT)
                    .description("Expert difficulty level")
                    .build());
        }
    }

    private void initQuestionStatuses() {
        if (questionStatusRepository.count() == 0) {
            questionStatusRepository.save(QuestionStatus.builder()
                    .statusName(QuestionStatusType.DRAFT)
                    .description("Question is in draft state")
                    .build());
            questionStatusRepository.save(QuestionStatus.builder()
                    .statusName(QuestionStatusType.REVIEW)
                    .description("Question is under review")
                    .build());
            questionStatusRepository.save(QuestionStatus.builder()
                    .statusName(QuestionStatusType.ACTIVE)
                    .description("Question is active and available")
                    .build());
            questionStatusRepository.save(QuestionStatus.builder()
                    .statusName(QuestionStatusType.ARCHIVED)
                    .description("Question has been archived")
                    .build());
        }
    }

    // ==================== Category & Tag Seeding ====================

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            List<CategoryJpaEntity> categories = Arrays.asList(
                    CategoryJpaEntity.builder()
                            .name("Frontend")
                            .description("Questions sur le développement frontend: HTML, CSS, JavaScript, frameworks et bibliothèques UI")
                            .isActive(true)
                            .build(),
                    CategoryJpaEntity.builder()
                            .name("Backend")
                            .description("Questions sur le développement backend: serveurs, APIs, bases de données, architectures")
                            .isActive(true)
                            .build(),
                    CategoryJpaEntity.builder()
                            .name("Devops")
                            .description("Questions sur DevOps: CI/CD, conteneurisation, cloud, infrastructure as code")
                            .isActive(true)
                            .build(),
                    CategoryJpaEntity.builder()
                            .name("Securite")
                            .description("Questions sur la sécurité informatique: vulnérabilités, bonnes pratiques, cryptographie")
                            .isActive(true)
                            .build(),
                    CategoryJpaEntity.builder()
                            .name("Data Science")
                            .description("Questions sur la science des données: machine learning, analyse de données, statistiques")
                            .isActive(true)
                            .build()
            );
            categoryRepository.saveAll(categories);
        }
    }

    private void initTags() {
        if (tagRepository.count() == 0) {
            // Get categories
            List<CategoryJpaEntity> categories = categoryRepository.findAll();
            CategoryJpaEntity frontend = findCategoryByName(categories, "Frontend");
            CategoryJpaEntity backend = findCategoryByName(categories, "Backend");
            CategoryJpaEntity devops = findCategoryByName(categories, "Devops");
            CategoryJpaEntity securite = findCategoryByName(categories, "Securite");
            CategoryJpaEntity dataScience = findCategoryByName(categories, "Data Science");

            List<TagJpaEntity> tags = new ArrayList<>();

            // ==================== Frontend Tags ====================
            tags.add(TagJpaEntity.builder().name("React").description("Bibliothèque JavaScript pour construire des interfaces utilisateur").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("Vue.js").description("Framework JavaScript progressif pour construire des interfaces utilisateur").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("Angular").description("Framework TypeScript pour construire des applications web").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("HTML/CSS").description("Langages de balisage et de style pour le web").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("JavaScript").description("Langage de programmation pour le web").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("TypeScript").description("Sur-ensemble typé de JavaScript").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("Tailwind CSS").description("Framework CSS utilitaire").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("Next.js").description("Framework React pour la production").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("Svelte").description("Framework JavaScript compilé").isActive(true).category(frontend).build());
            tags.add(TagJpaEntity.builder().name("Nuxt.js").description("Framework Vue.js pour la production").isActive(true).category(frontend).build());

            // ==================== Backend Tags ====================
            tags.add(TagJpaEntity.builder().name("Spring Boot").description("Framework Java pour construire des applications backend").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("Node.js").description("Environnement d'exécution JavaScript côté serveur").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("Django").description("Framework Python pour le développement web").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("Express.js").description("Framework web minimaliste pour Node.js").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("PostgreSQL").description("Système de gestion de base de données relationnelle").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("MongoDB").description("Base de données NoSQL orientée documents").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("MySQL").description("Système de gestion de base de données relationnelle").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("Redis").description("Base de données en mémoire, utilisée comme cache").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("GraphQL").description("Langage de requête pour les APIs").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("REST API").description("Architecture pour les services web").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("FastAPI").description("Framework Python moderne pour les APIs").isActive(true).category(backend).build());
            tags.add(TagJpaEntity.builder().name("NestJS").description("Framework Node.js pour construire des applications côté serveur").isActive(true).category(backend).build());

            // ==================== Devops Tags ====================
            tags.add(TagJpaEntity.builder().name("Docker").description("Plateforme de conteneurisation").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("Kubernetes").description("Système d'orchestration de conteneurs").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("CI/CD").description("Intégration continue et déploiement continu").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("Jenkins").description("Serveur d'automatisation open source").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("GitHub Actions").description("Automatisation des workflows GitHub").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("GitLab CI").description("Système CI/CD intégré à GitLab").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("AWS").description("Amazon Web Services - plateforme cloud").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("Azure").description("Plateforme cloud Microsoft").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("GCP").description("Google Cloud Platform").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("Terraform").description("Outil d'infrastructure as code").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("Ansible").description("Outil d'automatisation IT").isActive(true).category(devops).build());
            tags.add(TagJpaEntity.builder().name("Linux").description("Système d'exploitation open source").isActive(true).category(devops).build());

            // ==================== Securite Tags ====================
            tags.add(TagJpaEntity.builder().name("OWASP").description("Open Web Application Security Project").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("Cryptographie").description("Science du chiffrement et déchiffrement").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("Authentification").description("Mécanismes d'authentification et autorisation").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("Pentest").description("Tests d'intrusion et audits de sécurité").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("XSS").description("Cross-Site Scripting - vulnérabilité web").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("SQL Injection").description("Injection SQL - vulnérabilité de base de données").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("JWT").description("JSON Web Tokens pour l'authentification").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("OAuth2").description("Protocole d'autorisation").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("HTTPS/TLS").description("Protocoles de sécurité réseau").isActive(true).category(securite).build());
            tags.add(TagJpaEntity.builder().name("RGPD").description("Règlement Général sur la Protection des Données").isActive(true).category(securite).build());

            // ==================== Data Science Tags ====================
            tags.add(TagJpaEntity.builder().name("Python").description("Langage de programmation pour la data science").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Machine Learning").description("Algorithmes d'apprentissage automatique").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Deep Learning").description("Réseaux de neurones profonds").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Pandas").description("Bibliothèque Python pour la manipulation de données").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("NumPy").description("Bibliothèque Python pour le calcul numérique").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("TensorFlow").description("Framework Google pour le deep learning").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("PyTorch").description("Framework Facebook pour le deep learning").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Scikit-learn").description("Bibliothèque Python pour le machine learning").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Data Visualization").description("Visualisation de données avec Matplotlib, Seaborn").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("NLP").description("Traitement du langage naturel").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Statistics").description("Statistiques et probabilités").isActive(true).category(dataScience).build());
            tags.add(TagJpaEntity.builder().name("Big Data").description("Traitement de grandes quantités de données").isActive(true).category(dataScience).build());

            tagRepository.saveAll(tags);
        }
    }

    private CategoryJpaEntity findCategoryByName(List<CategoryJpaEntity> categories, String name) {
        return categories.stream()
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .orElse(null);
    }

    // ==================== Game Seeding ====================

    private void initGames() {
        if (gameRepository.count() == 0) {
            List<Game> games = Arrays.asList(
                    Game.builder()
                            .name("QCM")
                            .description("Jeu de Questions à Choix Multiples")
                            .build(),
                    Game.builder()
                            .name("SMATCH")
                            .description("Jeu de correspondance")
                            .build(),
                    Game.builder()
                            .name("TRUE_FALSE")
                            .description("Jeu Vrai ou Faux")
                            .build(),
                    Game.builder()
                            .name("DRAG_DROP")
                            .description("Jeu de glisser-déposer")
                            .build()
            );
            gameRepository.saveAll(games);
        }
    }

    // ==================== Import Questions from JSON Files ====================

    /**
     * Import questions from JSON files located in src/main/resources/data/questions/
     * Each JSON file should follow the QuestionImportRequest structure.
     * Files are automatically detected and imported on application startup.
     */
    private void importQuestionsFromJsonFiles() {
        // Only import if no questions exist
        long questionCount = questionRepository.count();
        System.out.println("[DEBUG] Current question count: " + questionCount);

        if (questionCount > 0) {
            System.out.println("Questions already exist in database. Skipping JSON import.");
            return;
        }

        System.out.println("=".repeat(60));
        System.out.println("IMPORTING QUESTIONS FROM JSON FILES");
        System.out.println("=".repeat(60));

        try {
            // Use PathMatchingResourcePatternResolver to find all JSON files in the questions directory
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:data/questions/*.json");

            System.out.println("[DEBUG] Found " + resources.length + " JSON files to import");

            int totalImported = 0;
            int totalSkipped = 0;
            List<String> importedFiles = new ArrayList<>();

            for (Resource resource : resources) {
                String filename = resource.getFilename();
                if (filename == null) continue;

                try {
                    System.out.println("\nImporting: " + filename);

                    // Use InputStream instead of getFile() for JAR compatibility
                    QuestionImportResponse response = questionImportService.importQuestionsFromInputStream(
                            resource.getInputStream(), filename);

                    totalImported += response.getImported();
                    totalSkipped += response.getSkipped();
                    importedFiles.add(filename + " (" + response.getImported() + " questions)");

                    System.out.println("  - Imported: " + response.getImported());
                    System.out.println("  - Skipped: " + response.getSkipped());
                    if (response.getCreatedTags() != null && !response.getCreatedTags().isEmpty()) {
                        System.out.println("  - Created tags: " + response.getCreatedTags());
                    }
                    if (response.getErrors() != null && !response.getErrors().isEmpty()) {
                        response.getErrors().forEach(e ->
                            System.out.println("  - Error: " + e.getError()));
                    }
                } catch (IOException e) {
                    System.out.println("  - Failed to read file: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            System.out.println("\n" + "=".repeat(60));
            System.out.println("IMPORT SUMMARY");
            System.out.println("=".repeat(60));
            System.out.println("Files processed: " + importedFiles.size());
            System.out.println("Total imported: " + totalImported);
            System.out.println("Total skipped: " + totalSkipped);
            importedFiles.forEach(f -> System.out.println("  - " + f));
            System.out.println("=".repeat(60));

            // Verify questions were actually saved
            System.out.println("[DEBUG] Final question count: " + questionRepository.count());

        } catch (IOException e) {
            System.out.println("Failed to scan for JSON files: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==================== Default Admin User ====================

    /**
     * Initialize default admin user.
     * Email: admin@teqizz.com
     * Password: Admin@123456
     *
     * IMPORTANT: Change this password in production!
     */
    private void initAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@teqizz.com").isEmpty()) {
            // Get ADMIN role and LOCAL provider
            Role adminRole = roleRepository.findByRoleName(RoleType.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            Provider localProvider = providerRepository.findByProviderName(ProviderType.LOCAL)
                    .orElseThrow(() -> new RuntimeException("LOCAL provider not found"));

            // Create admin user
            UserJpaEntity adminUser = UserJpaEntity.builder()
                    .username("admin")
                    .email("admin@teqizz.com")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .role(adminRole)
                    .provider(localProvider)
                    .build();

            userRepository.save(adminUser);

            System.out.println("=".repeat(60));
            System.out.println("DEFAULT ADMIN USER CREATED");
            System.out.println("Email: admin@teqizz.com");
            System.out.println("Password: Admin@123456");
            System.out.println("IMPORTANT: Change this password in production!");
            System.out.println("=".repeat(60));
        }
    }
}
