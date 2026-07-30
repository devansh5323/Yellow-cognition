import type { Metadata } from "next";
import { FumiWorldExperience } from "./components/FumiWorldExperience";

export const metadata: Metadata = {
  title: "FUMI — Enter a child's morning companion's world",
  description:
    "Fly through Fumi's world — wake with Fumi, play three focus games, and see a clear growth story as a parent. A gentle 3D companion for curious minds.",
};

export default function FumiWebsitePage() {
  return <FumiWorldExperience />;
}
