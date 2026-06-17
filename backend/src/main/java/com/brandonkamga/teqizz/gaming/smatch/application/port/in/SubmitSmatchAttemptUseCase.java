package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

public interface SubmitSmatchAttemptUseCase {

    record SubmitAttemptCommand(Long sessionId, Long pairId, Integer timeTakenMs) {}

    AttemptResultView submit(SubmitAttemptCommand command);

    record AttemptResultView(boolean correct, int pointsEarned, int livesRemaining,
                             int pairsMatched, int totalPairs, int totalScore,
                             boolean sessionCompleted, boolean gameOver) {}
}
