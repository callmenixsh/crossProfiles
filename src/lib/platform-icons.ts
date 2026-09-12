import {
  Award,
  Binary,
  Brain,
  ChefHat,
  GitBranch,
  GitFork,
  Keyboard,
  Leaf,
  Newspaper,
  Sparkles,
  Swords,
  type LucideIcon,
} from "lucide-react";
import type { PlatformKey } from "@/lib/providers/types";

export const PLATFORM_ICONS: Record<PlatformKey, LucideIcon> = {
  github: GitFork,
  leetcode: Binary,
  codeforces: Swords,
  gfg: Leaf,
  codechef: ChefHat,
  tuf: Sparkles,
  monkeytype: Keyboard,
  atcoder: Award,
  codewars: Brain,
  gitlab: GitBranch,
  devto: Newspaper,
};