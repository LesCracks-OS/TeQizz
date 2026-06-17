package com.brandonkamga.teqizz.gaming.smatch.domain.model;

import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchDeckId;
import com.brandonkamga.teqizz.shared.domain.DomainEntity;

public class SmatchPair extends DomainEntity<Long> {

    private final Long id;
    private final SmatchDeckId deckId;
    private final String term;
    private final String definition;
    private final String hint;

    private SmatchPair(Long id, SmatchDeckId deckId, String term, String definition, String hint) {
        this.id = id;
        this.deckId = deckId;
        this.term = term;
        this.definition = definition;
        this.hint = hint;
    }

    public static SmatchPair reconstitute(Long id, Long deckId, String term, String definition, String hint) {
        return new SmatchPair(id, SmatchDeckId.of(deckId), term, definition, hint);
    }

    @Override
    protected Long getId() { return id; }
    public SmatchDeckId getDeckId() { return deckId; }
    public String getTerm() { return term; }
    public String getDefinition() { return definition; }
    public String getHint() { return hint; }
}
