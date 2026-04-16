import type { SkillMetadata } from "../types";
import { bundledSkills as gsapSkills } from "./gsap";
import { allUiUxSkills } from "./ui-ux";

export const allBundledSkills: SkillMetadata[] = [
  ...gsapSkills,
  ...allUiUxSkills,
];
