import type { IconType } from 'react-icons';
import {
  LuBookOpen,
  LuBrain,
  LuBriefcase,
  LuBuilding2,
  LuCircleCheck,
  LuClock,
  LuCloud,
  LuFileText,
  LuFolderOpen,
  LuGamepad2,
  LuGlobe,
  LuHandshake,
  LuLayers,
  LuMail,
  LuMonitor,
  LuNetwork,
  LuPill,
  LuPuzzle,
  LuServer,
  LuSmartphone,
  LuTarget,
  LuTicket,
  LuTrendingUp,
  LuZap
} from 'react-icons/lu';

export const STARTER_TABS = ['popular', 'about', 'projects', 'tech', 'experience', 'contact'] as const;
export type StarterTab = (typeof STARTER_TABS)[number];
export type StarterCategory = Exclude<StarterTab, 'popular'>;

export type Starter = {
  /** Sent as `scenario.topicId`; the same topic ids the legacy chat used. */
  id: string;
  /** Key under `common.askBohdan.starters`. */
  labelKey: string;
  icon: IconType;
};

const focus: Starter = { id: 'focus', labelKey: 'focus', icon: LuTarget };
const english: Starter = { id: 'english', labelKey: 'english', icon: LuGlobe };
const strengths: Starter = { id: 'strengths', labelKey: 'aboutStrengths', icon: LuZap };
const roleFit: Starter = { id: 'roleFit', labelKey: 'aboutRoleFit', icon: LuPuzzle };

const projects: Starter = { id: 'projects', labelKey: 'projects', icon: LuFolderOpen };
const bookPortfolio: Starter = { id: 'bookPortfolio', labelKey: 'projectBookPortfolio', icon: LuBookOpen };
const rixLogger: Starter = { id: 'rixLogger', labelKey: 'projectRixLogger', icon: LuSmartphone };
const ticketing: Starter = { id: 'ticketing', labelKey: 'projectTicketing', icon: LuTicket };
const pharmacyApi: Starter = { id: 'pharmacyApi', labelKey: 'projectPharmacyApi', icon: LuPill };

const tech: Starter = { id: 'tech', labelKey: 'tech', icon: LuLayers };
const frontend: Starter = { id: 'frontend', labelKey: 'techFrontend', icon: LuMonitor };
const backend: Starter = { id: 'backend', labelKey: 'techBackend', icon: LuServer };
const mobile: Starter = { id: 'mobile', labelKey: 'techMobile', icon: LuSmartphone };
const ai: Starter = { id: 'ai', labelKey: 'techAi', icon: LuBrain };
const devops: Starter = { id: 'devops', labelKey: 'techDevops', icon: LuCloud };

const experience: Starter = { id: 'experience', labelKey: 'experience', icon: LuBriefcase };
const artadian: Starter = { id: 'artadian', labelKey: 'expArtadian', icon: LuGamepad2 };
const silinexx: Starter = { id: 'silinexx', labelKey: 'expSilinexx', icon: LuBuilding2 };
const wnet: Starter = { id: 'wnet', labelKey: 'expWnet', icon: LuNetwork };
const growth: Starter = { id: 'growth', labelKey: 'expGrowth', icon: LuTrendingUp };

const contact: Starter = { id: 'contact', labelKey: 'contact', icon: LuMail };
const hiring: Starter = { id: 'hiring', labelKey: 'contactHiring', icon: LuHandshake };
const timezone: Starter = { id: 'timezone', labelKey: 'contactTimezone', icon: LuClock };
const availability: Starter = { id: 'availability', labelKey: 'contactAvailability', icon: LuCircleCheck };
const resumeDownload: Starter = { id: 'resumeDownload', labelKey: 'resumeDownload', icon: LuFileText };

/** The topic rows per tab. The category tabs list the legacy chat's topics; "popular" picks the most asked from them. */
export const STARTERS: Record<StarterTab, Starter[]> = {
  popular: [tech, projects, experience, availability, resumeDownload, contact],
  about: [focus, english, strengths, roleFit],
  projects: [projects, bookPortfolio, rixLogger, ticketing, pharmacyApi],
  tech: [tech, frontend, backend, mobile, ai, devops],
  experience: [experience, artadian, silinexx, wnet, growth],
  contact: [contact, hiring, timezone, availability, resumeDownload]
};

export const isStarterCategory = (tab: StarterTab): tab is StarterCategory => tab !== 'popular';
