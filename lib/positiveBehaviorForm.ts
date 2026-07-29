// Static option sets + "Yellow suggests" content for the structured
// Log Positive Behaviour form. Mirrors lib/behaviorForm.ts's pattern —
// mocked-AI-suggestion content, same as AI_SUGGESTIONS / DOMAIN_INTERVENTIONS
// elsewhere in this app.

export type RecognitionTarget = "individual" | "small-group" | "whole-class";

export const RECOGNITION_TARGETS: { value: RecognitionTarget; label: string }[] = [
  { value: "individual", label: "Individual student" },
  { value: "small-group", label: "Small group" },
  { value: "whole-class", label: "Whole class" },
];

export type StrengthTag =
  | "Followed instructions"
  | "Stayed focused"
  | "Completed task"
  | "Started task independently"
  | "Helped a peer"
  | "Waited turn"
  | "Used kind words"
  | "Managed frustration"
  | "Returned to task"
  | "Transitioned smoothly"
  | "Participated positively"
  | "Showed responsibility"
  | "Used a strategy"
  | "Persisted through challenge"
  | "Included others"
  | "Resolved conflict calmly"
  | "Came prepared"
  | "Improved from last time"
  | "Other";

export const STRENGTH_OPTIONS: StrengthTag[] = [
  "Followed instructions",
  "Stayed focused",
  "Completed task",
  "Started task independently",
  "Helped a peer",
  "Waited turn",
  "Used kind words",
  "Managed frustration",
  "Returned to task",
  "Transitioned smoothly",
  "Participated positively",
  "Showed responsibility",
  "Used a strategy",
  "Persisted through challenge",
  "Included others",
  "Resolved conflict calmly",
  "Came prepared",
  "Improved from last time",
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

export const CONTEXT_OPTIONS = [
  "Whole-class instruction",
  "Independent work",
  "Group work",
  "Transition",
  "Arrival",
  "Dismissal",
  "Lunch",
  "Playground",
  "Hallway",
  "Homework review",
  "Assessment / test",
  "Other",
] as const;

export const TIME_OF_DAY_OPTIONS = ["Morning", "Midday", "Afternoon", "End of day"] as const;

export type RecognitionOption =
  | "Verbal praise"
  | "Private praise"
  | "Class shoutout"
  | "Point / token awarded"
  | "Badge awarded"
  | "Parent share"
  | "Peer recognition"
  | "Responsibility given"
  | "Note home"
  | "No recognition yet"
  | "Other";

export const RECOGNITION_OPTIONS: RecognitionOption[] = [
  "Verbal praise",
  "Private praise",
  "Class shoutout",
  "Point / token awarded",
  "Badge awarded",
  "Parent share",
  "Peer recognition",
  "Responsibility given",
  "Note home",
  "No recognition yet",
  "Other",
];

export const POINTS_OPTIONS = ["1", "2", "5", "Custom"] as const;

export type ShareOption =
  | "Add to student profile only"
  | "Share with parent"
  | "Share with special educator / support team"
  | "Add to class celebration"
  | "Use as strength in next report"
  | "No sharing needed";

export const SHARE_OPTIONS: ShareOption[] = [
  "Add to student profile only",
  "Share with parent",
  "Share with special educator / support team",
  "Add to class celebration",
  "Use as strength in next report",
  "No sharing needed",
];

export type GrowthOption =
  | "First time noticed"
  | "Improving recently"
  | "Consistent strength"
  | "Stronger than last week"
  | "Not sure";

export const GROWTH_OPTIONS: GrowthOption[] = [
  "First time noticed",
  "Improving recently",
  "Consistent strength",
  "Stronger than last week",
  "Not sure",
];

export type PositiveSuggestion = {
  mapsTo: string[];
  relatedSkills: string[];
  reinforcement: string[];
};

const SUGGESTIONS: Record<StrengthTag, PositiveSuggestion> = {
  "Followed instructions": {
    mapsTo: ["Task Engagement", "Learning Readiness"],
    relatedSkills: ["Listening comprehension", "Working memory"],
    reinforcement: [
      "Name the specific instruction they followed",
      "Let them help explain the step to a peer",
      "Add this to their profile as a growing strength",
    ],
  },
  "Stayed focused": {
    mapsTo: ["Attention & Focus"],
    relatedSkills: ["Sustained attention", "Self-monitoring"],
    reinforcement: [
      "Point out specifically what helped them focus",
      "Use them as a peer model during independent work",
      "Send a positive parent note",
    ],
  },
  "Completed task": {
    mapsTo: ["Task Engagement"],
    relatedSkills: ["Task initiation", "Persistence"],
    reinforcement: [
      "Highlight the completed work in front of the class",
      "Add this strength to their student profile",
      "Send a positive parent note",
    ],
  },
  "Started task independently": {
    mapsTo: ["Task Engagement", "Learning Readiness"],
    relatedSkills: ["Task initiation", "Self-direction"],
    reinforcement: [
      "Praise the independent start immediately",
      "Use as a peer model during independent work",
      "Add this strength to their student profile",
    ],
  },
  "Helped a peer": {
    mapsTo: ["Behaviour & Discipline", "Learning Readiness"],
    relatedSkills: ["Peer interaction", "Cooperation", "Impulse control", "Positive communication"],
    reinforcement: [
      "Send a positive parent note",
      "Use as a peer model during group work",
      "Add this strength to student profile",
    ],
  },
  "Waited turn": {
    mapsTo: ["Behaviour & Discipline"],
    relatedSkills: ["Impulse control", "Patience / self-regulation"],
    reinforcement: [
      "Praise the waiting behaviour right when it happens",
      "Use as a peer model for turn-taking",
      "Add this strength to student profile",
    ],
  },
  "Used kind words": {
    mapsTo: ["Behaviour & Discipline"],
    relatedSkills: ["Positive communication", "Emotional regulation"],
    reinforcement: [
      "Give a specific verbal shoutout in front of the class",
      "Send a positive parent note",
      "Add this strength to student profile",
    ],
  },
  "Managed frustration": {
    mapsTo: ["Behaviour & Discipline", "Emotional Regulation"],
    relatedSkills: ["Emotional regulation", "Coping strategies"],
    reinforcement: [
      "Name the coping strategy they used",
      "Send a positive parent note",
      "Add this strength to student profile",
    ],
  },
  "Returned to task": {
    mapsTo: ["Task Engagement", "Attention & Focus"],
    relatedSkills: ["Self-monitoring", "Resilience"],
    reinforcement: [
      "Praise the recovery, not just the task",
      "Add this strength to student profile",
      "Use as a peer model during independent work",
    ],
  },
  "Transitioned smoothly": {
    mapsTo: ["Transition Readiness"],
    relatedSkills: ["Cognitive flexibility", "Self-regulation"],
    reinforcement: [
      "Praise the smooth transition immediately",
      "Use as a peer model during transitions",
      "Add this strength to student profile",
    ],
  },
  "Participated positively": {
    mapsTo: ["Learning Readiness", "Behaviour & Discipline"],
    relatedSkills: ["Engagement", "Positive communication"],
    reinforcement: [
      "Give a class shoutout for participation",
      "Send a positive parent note",
      "Add this strength to student profile",
    ],
  },
  "Showed responsibility": {
    mapsTo: ["Behaviour & Discipline"],
    relatedSkills: ["Accountability", "Self-monitoring"],
    reinforcement: [
      "Give them a class responsibility as recognition",
      "Send a positive parent note",
      "Add this strength to student profile",
    ],
  },
  "Used a strategy": {
    mapsTo: ["Task Engagement", "Learning Readiness"],
    relatedSkills: ["Self-regulation", "Metacognition"],
    reinforcement: [
      "Ask them to share the strategy with the class",
      "Add this strength to student profile",
      "Use as a peer model during independent work",
    ],
  },
  "Persisted through challenge": {
    mapsTo: ["Task Engagement"],
    relatedSkills: ["Persistence", "Frustration tolerance"],
    reinforcement: [
      "Name the specific challenge they pushed through",
      "Send a positive parent note",
      "Add this strength to student profile",
    ],
  },
  "Included others": {
    mapsTo: ["Behaviour & Discipline"],
    relatedSkills: ["Peer interaction", "Empathy"],
    reinforcement: [
      "Give a class shoutout for inclusion",
      "Send a positive parent note",
      "Use as a peer model during group work",
    ],
  },
  "Resolved conflict calmly": {
    mapsTo: ["Behaviour & Discipline", "Emotional Regulation"],
    relatedSkills: ["Conflict resolution", "Emotional regulation"],
    reinforcement: [
      "Name the specific de-escalation they used",
      "Send a positive parent note",
      "Add this strength to student profile",
    ],
  },
  "Came prepared": {
    mapsTo: ["Learning Readiness"],
    relatedSkills: ["Organisation", "Responsibility"],
    reinforcement: [
      "Praise the preparation specifically",
      "Add this strength to student profile",
      "Send a positive parent note",
    ],
  },
  "Improved from last time": {
    mapsTo: ["Learning Readiness"],
    relatedSkills: ["Growth mindset", "Self-monitoring"],
    reinforcement: [
      "Show them the specific improvement you noticed",
      "Add this strength to student profile",
      "Use as strength in the next report",
    ],
  },
  Other: {
    mapsTo: ["General"],
    relatedSkills: ["Self-monitoring"],
    reinforcement: ["Add detail in the quick note so Yellow can refine this next time"],
  },
};

export function getPositiveSuggestion(tag: StrengthTag | null): PositiveSuggestion {
  return SUGGESTIONS[tag ?? "Helped a peer"];
}
