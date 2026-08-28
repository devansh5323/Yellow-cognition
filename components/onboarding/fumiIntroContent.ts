// Content for the "Meet Fumi" onboarding screens — one entry per screen,
// in order. Add new screens here as they're provided; FumiIntro.tsx
// carousels through them automatically.

// Which illustration a screen shows — "none" is text-only, "mascot" is
// just Fumi, "app-preview" is the small reports/activities mockup with
// Fumi peeking in. Add more kinds here (in FumiIntroVisual.tsx) as new
// screens call for them.
export type FumiIntroVisual = "none" | "mascot" | "app-preview";

export type FumiIntroScreen = {
  title: string;
  body: string;
  bottomText: string;
  cta: string;
  visual?: FumiIntroVisual;
};

export const FUMI_INTRO_SCREENS: FumiIntroScreen[] = [
  {
    title: "See what's shaping your classroom",
    body: "Yellow brings together your observations, parent inputs, students' behavior, engagement, and well-being to identify where they need support.",
    bottomText: "Yellow turns classroom signals into clear areas of focus.",
    cta: "Next",
    visual: "none",
  },
  {
    title: "Fumi turns those insights into practice",
    body: "An AI-powered digital therapy app that helps students work on identified skills through personalised games and activities.",
    bottomText: "Support your students receive directly at home.",
    cta: "Next",
    visual: "app-preview",
  },
];
