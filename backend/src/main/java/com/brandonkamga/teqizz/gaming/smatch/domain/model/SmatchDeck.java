package com.brandonkamga.teqizz.gaming.smatch.domain.model;

import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchDeckId;
import com.brandonkamga.teqizz.shared.domain.AggregateRoot;

import java.util.List;

public class SmatchDeck extends AggregateRoot<SmatchDeckId> {

    private final SmatchDeckId id;
    private final String name;
    private final String description;
    private final String difficulty;
    private final Long categoryId;
    private final List<SmatchPair> pairs;

    private SmatchDeck(SmatchDeckId id, String name, String description, String difficulty,
                       Long categoryId, List<SmatchPair> pairs) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.difficulty = difficulty;
        this.categoryId = categoryId;
        this.pairs = pairs != null ? List.copyOf(pairs) : List.of();
    }

    public static SmatchDeck reconstitute(Long id, String name, String description, String difficulty,
                                          Long categoryId, List<SmatchPair> pairs) {
        return new SmatchDeck(SmatchDeckId.of(id), name, description, difficulty, categoryId, pairs);
    }

    public SmatchDeckId getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getDifficulty() { return difficulty; }
    public Long getCategoryId() { return categoryId; }
    public List<SmatchPair> getPairs() { return pairs; }
    public int size() { return pairs.size(); }
}
