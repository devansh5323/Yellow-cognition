// Static option sets + "Yellow suggests" content for the structured
// Record Behaviour form. The suggestion content is templated per selected
// "what happened" tag — same mocked-AI-suggestion pattern already used for
// AI_SUGGESTIONS / DOMAIN_INTERVENTIONS elsewhere in this app.

export type WhatHappenedTag =
  | "Off-task behavior"
  | "Disruption"
  | "Task refusal"
  | "Missed work"
  | "Delayed work"
  | "Peer conflict"
  | "Difficulty waiting"
  | "Difficulty transitioning"
  | "Emotional outburst"
  | "Unsafe behavior"
  | "Repeated reminders needed"
  | "Incomplete instructions"
  | "Avoidance"
  | "Classroom rule violation"
  | "Other";

export const WHAT_HAPPENED_OPTIONS: WhatHappenedTag[] = [
  "Off-task behavior",
  "Disruption",
  "Task refusal",
  "Missed work",
  "Delayed work",
  "Peer conflict",
  "Difficulty waiting",
  "Difficulty transitioning",
  "Emotional outburst",
  "Unsafe behavior",
  "Repeated reminders needed",
  "Incomplete instructions",
  "Avoidance",
  "Classroom rule violation",
  "Other",
];

export type PbisExpectation =
  | "Be Ready to Learn"
  | "Be Responsible"
  | "Be Respectful"
  | "Be Safe"
  | "Be Kind"
  | "Be Prepared";

export const PBIS_EXPECTATIONS: PbisExpectation[] = [
  "Be Ready to Learn",
  "Be Responsible",
  "Be Respectful",
  "Be Safe",
  "Be Kind",
  "Be Prepared",
];

export type Severity = "Minor" | "Major";

export const ACTIVITY_OPTIONS = [
  "Independent work",
  "Group work",
  "Instruction",
  "Transition",
  "Other",
] as const;

export const LOCATION_OPTIONS = ["Classroom", "Hallway", "Playground", "Cafeteria"] as const;

export const TIME_OF_DAY_OPTIONS = ["Morning", "Midday", "Afternoon", "End of day"] as const;

export const ANTECEDENT_OPTIONS = [
  "Difficult task",
  "Long wait",
  "Transition",
  "Peer interaction",
  "Change in routine",
  "Noise / distraction",
  "Correction",
  "Unknown",
] as const;

export const RESPONSE_OPTIONS = [
  "Verbal reminder",
  "Visual cue",
  "Changed seating",
  "Break offered",
  "Private conversation",
  "Peer separation",
  "Sent to support team",
  "Other",
] as const;

export const RECOVERY_OPTIONS = [
  "Returned to task",
  "Needed more reminders",
  "Did not return to task",
  "Escalated",
  "Not observed",
] as const;

// Parent communication and special-educator referral are their own
// dedicated required fields (see the checklist), so they're intentionally
// not options here — this list is just the "what kind of follow-up" detail.
export type FollowUpOption =
  | "No follow-up"
  | "Add to profile"
  | "Tier 2 review"
  | "1:1 check-in"
  | "Create follow-up"
  | "Urgent support";

export const FOLLOWUP_OPTIONS: FollowUpOption[] = [
  "No follow-up",
  "Add to profile",
  "Tier 2 review",
  "1:1 check-in",
  "Create follow-up",
  "Urgent support",
];

export type BehaviorSuggestion = {
  mapsTo: string[];
  relatedSkills: string[];
  nextSteps: string[];
};

const SUGGESTIONS: Record<WhatHappenedTag, BehaviorSuggestion> = {
  "Off-task behavior": {
    mapsTo: ["Attention & Focus", "Task Engagement"],
    relatedSkills: ["Sustained attention", "Self-monitoring", "Task initiation"],
    nextSteps: [
      "Try a visual checklist for independent work",
      "Break tasks into smaller steps",
      "Praise on-task behaviour early",
    ],
  },
  Disruption: {
    mapsTo: ["Behaviour & Discipline", "Classroom Climate"],
    relatedSkills: ["Impulse control", "Self-regulation"],
    nextSteps: [
      "Use a pre-agreed non-verbal cue",
      "Offer a movement break before the activity",
      "Reset expectations privately, not in front of peers",
    ],
  },
  "Task refusal": {
    mapsTo: ["Task Engagement", "Learning Readiness"],
    relatedSkills: ["Task initiation", "Frustration tolerance"],
    nextSteps: [
      "Offer a choice in how the task is completed",
      "Check the task isn't too far above current skill level",
      "Start the first step together, then step back",
    ],
  },
  "Missed work": {
    mapsTo: ["Task Engagement"],
    relatedSkills: ["Task initiation", "Working memory"],
    nextSteps: [
      "Confirm the student has the materials they need",
      "Send a same-day reminder home",
      "Check in before independent work begins",
    ],
  },
  "Delayed work": {
    mapsTo: ["Task Engagement", "Attention & Focus"],
    relatedSkills: ["Processing speed", "Sustained attention"],
    nextSteps: [
      "Chunk the assignment into timed segments",
      "Use a visible timer for pacing",
      "Check for understanding before starting",
    ],
  },
  "Peer conflict": {
    mapsTo: ["Behaviour & Discipline", "Social Skills"],
    relatedSkills: ["Emotional regulation", "Conflict resolution"],
    nextSteps: [
      "Separate seating for the rest of the period",
      "Debrief with both students separately first",
      "Loop in a counsellor if this repeats",
    ],
  },
  "Difficulty waiting": {
    mapsTo: ["Attention & Focus", "Behaviour & Discipline"],
    relatedSkills: ["Impulse control", "Patience / self-regulation"],
    nextSteps: [
      "Give a specific job while waiting",
      "Use a visual countdown for transitions",
      "Praise waiting behaviour when it happens",
    ],
  },
  "Difficulty transitioning": {
    mapsTo: ["Transition Readiness"],
    relatedSkills: ["Cognitive flexibility", "Self-regulation"],
    nextSteps: [
      "Give a 2-minute warning before transitions",
      "Use a consistent transition signal",
      "Pair with a peer buddy for transitions",
    ],
  },
  "Emotional outburst": {
    mapsTo: ["Behaviour & Discipline", "Emotional Regulation"],
    relatedSkills: ["Emotional regulation", "Coping strategies"],
    nextSteps: [
      "Offer a calm-down space or break before re-engaging",
      "Debrief once the student has fully settled, not immediately after",
      "Identify the trigger together to plan ahead",
    ],
  },
  "Unsafe behavior": {
    mapsTo: ["Behaviour & Discipline", "Safety"],
    relatedSkills: ["Impulse control", "Self-regulation"],
    nextSteps: [
      "Follow the school's safety protocol immediately",
      "Document and notify admin / the special educator",
      "Schedule a follow-up conversation once the student is calm",
    ],
  },
  "Repeated reminders needed": {
    mapsTo: ["Attention & Focus", "Behaviour & Discipline"],
    relatedSkills: ["Self-monitoring", "Working memory"],
    nextSteps: [
      "Move to proximity instead of verbal reminders",
      "Try a visual or tactile cue instead",
      "Track reminder frequency to spot patterns",
    ],
  },
  "Incomplete instructions": {
    mapsTo: ["Task Engagement", "Learning Readiness"],
    relatedSkills: ["Working memory", "Following multi-step instructions"],
    nextSteps: [
      "Break instructions into single steps, one at a time",
      "Have the student repeat instructions back before starting",
      "Pair verbal instructions with a written or visual checklist",
    ],
  },
  Avoidance: {
    mapsTo: ["Task Engagement", "Learning Readiness"],
    relatedSkills: ["Task initiation", "Frustration tolerance"],
    nextSteps: [
      "Check whether the task feels too difficult or too long",
      "Offer a lower-stakes entry point to the task",
      "Praise effort, not just completion, to lower the stakes",
    ],
  },
  "Classroom rule violation": {
    mapsTo: ["Behaviour & Discipline"],
    relatedSkills: ["Rule awareness", "Self-monitoring"],
    nextSteps: [
      "Revisit the specific expectation privately with the student",
      "Use a visual reminder of classroom rules nearby",
      "Reinforce the very next time the rule is followed",
    ],
  },
  Other: {
    mapsTo: ["General"],
    relatedSkills: ["Self-monitoring"],
    nextSteps: ["Add detail in the quick note so Yellow can refine this next time"],
  },
};

export function getBehaviorSuggestion(tag: WhatHappenedTag | null): BehaviorSuggestion {
  return SUGGESTIONS[tag ?? "Off-task behavior"];
}
