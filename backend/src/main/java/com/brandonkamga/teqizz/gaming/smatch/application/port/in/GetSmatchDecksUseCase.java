package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

import java.util.List;

public interface GetSmatchDecksUseCase {

    /** Active decks, optionally narrowed by category and/or a tag (both optional). */
    List<SmatchDeckView> getActiveDecks(Long categoryId, Long tagId);

    SmatchDeckDetailView getDeckById(Long deckId);

    record TagRefView(Long id, String name) {}

    record SmatchDeckView(Long id, String name, String description, String difficulty,
                          Long categoryId, String categoryName, List<TagRefView> tags, int pairCount) {}

    record SmatchDeckDetailView(Long id, String name, String description, String difficulty,
                                Long categoryId, String categoryName, List<TagRefView> tags,
                                List<SmatchPairView> pairs) {}

    record SmatchPairView(Long id, String term, String definition, String hint) {}
}
