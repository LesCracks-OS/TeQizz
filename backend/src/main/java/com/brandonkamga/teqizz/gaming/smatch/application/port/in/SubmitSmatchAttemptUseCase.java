package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

public interface SubmitSmatchAttemptUseCase {

    /**
     * A Smatch attempt is the player asserting "the term of pair {@code termPairId}
     * matches the definition of pair {@code definitionPairId}". The match is correct
     * only when both ids are the same pair — correctness is decided server-side, never
     * trusted from the client. {@code timeTakenMs} is optional telemetry.
     */
    record SubmitAttemptCommand(Long sessionId, Long termPairId, Long definitionPairId, Integer timeTakenMs) {}

    AttemptResultView submit(SubmitAttemptCommand command);

    /**
     * @param alreadyMatched true when the asserted pair was already matched earlier in the
     *                       session (idempotent no-op — no points, no life lost).
     */
    record AttemptResultView(boolean correct, boolean alreadyMatched, int pointsEarned, int livesRemaining,
                             int pairsMatched, int totalPairs, int totalScore,
                             boolean sessionCompleted, boolean gameOver) {}
}
