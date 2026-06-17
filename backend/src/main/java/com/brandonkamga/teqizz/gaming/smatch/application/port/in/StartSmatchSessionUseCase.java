package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

public interface StartSmatchSessionUseCase {

    record StartSmatchSessionCommand(Long userId, Long deckId, String gameMode) {}

    SmatchSessionView start(StartSmatchSessionCommand command);

    record SmatchSessionView(Long sessionId, Long deckId, String deckName, String gameMode,
                             int livesRemaining, int totalScore, int pairsMatched, int totalPairs,
                             boolean completed) {}
}
