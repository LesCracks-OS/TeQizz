package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

import java.util.List;

public interface GetSmatchDecksUseCase {

    List<SmatchDeckView> getActiveDecks(Long categoryId);

    SmatchDeckDetailView getDeckById(Long deckId);

    record SmatchDeckView(Long id, String name, String description, String difficulty,
                          Long categoryId, String categoryName, int pairCount) {}

    record SmatchDeckDetailView(Long id, String name, String description, String difficulty,
                                Long categoryId, String categoryName,
                                List<SmatchPairView> pairs) {}

    record SmatchPairView(Long id, String term, String definition, String hint) {}
}
