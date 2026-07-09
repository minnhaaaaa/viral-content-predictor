def score_account_health(
    follower_count: int, avg_views_last_10: float, days_since_last_post: int
) -> dict:
    """
    Scores account health based on posting consistency, engagement ratio,
    and follower count. Pure arithmetic, no external dependencies.
    Returns score 0-10 plus a breakdown explaining why.
    """
    score = 0.0
    reasons = []

    # New account with very low followers —> cap score low regardless of other factors
    if follower_count < 100:
        return {
            "score": 2.0,
            "reasons": [
                "New or very small account — algorithm has limited historical data to calibrate distribution."
            ],
        }

    # Posting consistency
    if days_since_last_post <= 3:
        score += 3.0
        reasons.append("Posted recently (within 3 days) — good consistency signal.")
    elif days_since_last_post <= 7:
        score += 1.5
        reasons.append("Posted within the last week — moderate consistency.")
    else:
        reasons.append(
            "No recent posts — inconsistent posting hurts algorithmic trust."
        )

    # View to follower ratio (engagement rate proxy)
    if follower_count > 0:
        ratio = avg_views_last_10 / follower_count
        if ratio > 0.01:
            score += 4.0
            reasons.append(
                f"Average views are {round(ratio * 100, 1)}% of follower count — strong engagement rate."
            )
        elif ratio > 0.005:
            score += 2.0
            reasons.append(
                f"Average views are {round(ratio * 100, 1)}% of follower count — moderate engagement rate."
            )
        else:
            reasons.append(
                f"Average views are only {round(ratio * 100, 2)}% of follower count — low engagement rate."
            )

    # Follower count threshold
    if follower_count >= 1000:
        score += 3.0
        reasons.append(
            "Follower count above 1,000 — algorithm has enough history for wider distribution."
        )
    elif follower_count >= 500:
        score += 1.5
        reasons.append("Follower count is moderate — some algorithmic trust built.")
    else:
        reasons.append("Follower count below 500 — limited algorithmic trust so far.")

    return {"score": round(min(score, 10.0), 2), "reasons": reasons}
