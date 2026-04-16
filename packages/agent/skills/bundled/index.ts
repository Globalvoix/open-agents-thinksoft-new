import type { SkillMetadata } from "../types";
import { bundledSkills as gsapSkills } from "./gsap";
import { allUiUxSkills } from "./ui-ux";
import { anthropicsSkills } from "./anthropics";
import { vercelSkills } from "./vercel";
import { benciumSkills } from "./bencium";
import { accesslintSkills } from "./accesslint";

export const allBundledSkills: SkillMetadata[] = [
  ...gsapSkills,
  ...allUiUxSkills,
  ...anthropicsSkills,
  ...vercelSkills,
  ...benciumSkills,
  ...accesslintSkills,
];
