/**
 * ACS content moderation result. Surfaces on streaming chunks when a
 * server-side moderation policy has flagged the content.
 */
export interface PolicyViolation {
    result: "contentBlocked" | "warning";
}

export default PolicyViolation;
