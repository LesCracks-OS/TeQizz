package com.brandonkamga.teqizz.gaming.smatch.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.dto.importData.SmatchDeckImportRequest;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchDeckJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchPairJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchDeckRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchPairRepository;
import com.brandonkamga.teqizz.shared.domain.ContentNormalizer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Loads Smatch decks (+ pairs) from JSON. Idempotent: a deck whose name already exists is skipped,
 * and duplicate pairs within a deck are dropped (via the content hash) — so it can run on every boot.
 */
@Service
public class SmatchDeckImportApplicationService {

    private final SmatchDeckRepository deckRepository;
    private final SmatchPairRepository pairRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    public SmatchDeckImportApplicationService(SmatchDeckRepository deckRepository,
                                              SmatchPairRepository pairRepository,
                                              CategoryRepository categoryRepository,
                                              ObjectMapper objectMapper) {
        this.deckRepository = deckRepository;
        this.pairRepository = pairRepository;
        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
    }

    /** @return the number of decks created (existing ones are skipped). */
    @Transactional
    public int importFromInputStream(InputStream is) throws Exception {
        SmatchDeckImportRequest request = objectMapper.readValue(is, SmatchDeckImportRequest.class);
        if (request.getDecks() == null) return 0;

        int created = 0;
        for (SmatchDeckImportRequest.DeckData d : request.getDecks()) {
            if (d.getName() == null || d.getName().isBlank()) continue;
            if (deckRepository.findByName(d.getName()).isPresent()) continue; // idempotent

            CategoryJpaEntity category = d.getCategoryName() != null
                    ? categoryRepository.findByName(d.getCategoryName()).orElse(null)
                    : null;

            SmatchDeckJpaEntity deck = deckRepository.save(SmatchDeckJpaEntity.builder()
                    .name(d.getName())
                    .description(d.getDescription())
                    .category(category)
                    .difficulty(d.getDifficulty() != null ? d.getDifficulty().toUpperCase() : "EASY")
                    .isActive(true)
                    .build());

            Set<String> seen = new LinkedHashSet<>();
            List<SmatchPairJpaEntity> pairs = new ArrayList<>();
            if (d.getPairs() != null) {
                for (SmatchDeckImportRequest.PairData p : d.getPairs()) {
                    if (p.getTerm() == null || p.getTerm().isBlank()
                            || p.getDefinition() == null || p.getDefinition().isBlank()) continue;
                    String hash = ContentNormalizer.hash(p.getTerm(), p.getDefinition());
                    if (!seen.add(hash)) continue; // drop duplicate pairs inside the deck
                    pairs.add(SmatchPairJpaEntity.builder()
                            .deck(deck).term(p.getTerm()).definition(p.getDefinition())
                            .hint(p.getHint()).contentHash(hash).isActive(true).build());
                }
            }
            pairRepository.saveAll(pairs);
            created++;
        }
        return created;
    }
}
