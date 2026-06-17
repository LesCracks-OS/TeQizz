package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

public interface GetSmatchResultUseCase {

    SmatchResultView getResult(Long sessionId);

    record SmatchResultView(Long sessionId, String deckName, String gameMode,
                            int totalScore, int pairsMatched, int totalPairs,
                            int wrongAttempts, Long durationSeconds, boolean completed) {}
}
