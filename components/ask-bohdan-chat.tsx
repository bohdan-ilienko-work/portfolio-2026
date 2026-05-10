'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { BsChatTextFill, BsSendFill } from 'react-icons/bs';
import { useTranslations } from 'next-intl';

import { links } from '@/config';

type ChatAction = {
  type: 'download-cv';
  href: string;
  label: string;
};

type ChatMessage = { role: 'user' | 'assistant'; content: string; action?: ChatAction };
type ApiSuccess = { ok: true; answer: string; sources: Array<{ source: string; chunk: number }> };
type ApiError = { ok: false; error: string };
type ContactApiSuccess = { ok: true };
type ContactApiError = { ok: false; error: string };
type ContactFlowEvalSuccess = {
  ok: true;
  result: {
    status: 'valid' | 'invalid' | 'abusive' | 'cancel';
    normalizedValue?: string;
    reason?: string;
  };
};
type ContactFlowEvalError = { ok: false; error: string };
type ContactIntentEvalSuccess = {
  ok: true;
  result: {
    intent: 'contact' | 'other';
    confidence?: number;
  };
};
type ContactIntentEvalError = { ok: false; error: string };
type ContactFlowConsentEvalSuccess = {
  ok: true;
  result: {
    decision: 'accept' | 'decline' | 'other';
    confidence?: number;
  };
};
type ContactFlowConsentEvalError = { ok: false; error: string };
type ScenarioCategoryId = 'about' | 'projects' | 'tech' | 'experience' | 'contact';
type ScenarioTopic = { id: string; label: string; question: string };
type ContactFlowStep = 'name' | 'contact' | 'proposal' | 'callTime';
type ContactFlowState = {
  active: boolean;
  step: ContactFlowStep;
  name: string;
  contact: string;
  proposal: string;
  callTime: string | null;
};
type SendQuestionOptions = {
  forceContactFlow?: boolean;
  bypassContactFlow?: boolean;
};

const CATEGORY_ICONS: Record<ScenarioCategoryId, string> = {
  about: '👤',
  projects: '🗂️',
  tech: '🛠️',
  experience: '💼',
  contact: '📩',
};

const TOPIC_ICONS: Record<string, string> = {
  focus: '🎯',
  english: '🌍',
  strengths: '⚡',
  roleFit: '🧩',
  projects: '🗂️',
  bookPortfolio: '📘',
  skillHub: '🧠',
  ticketing: '🎟️',
  pharmacyApi: '💊',
  tech: '🛠️',
  frontend: '🖥️',
  backend: '⚙️',
  mobile: '📱',
  ai: '🤖',
  devops: '☁️',
  experience: '💼',
  artadian: '🎮',
  silinexx: '🏢',
  wnet: '🌐',
  growth: '📈',
  contact: '📩',
  hiring: '🤝',
  timezone: '🕒',
  availability: '✅',
  resumeDownload: '📄',
};

const SPIN_BG = 'conic-gradient(from 90deg at 50% 50%,#E2CBFF 0%,#393BB2 50%,#E2CBFF 100%)';
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_PART_REGEX = /^https?:\/\/[^\s]+$/;
const CONTACT_INTENT_REGEX = /(contact|reach|hire|collab|cooperate|proposal|call|meet|linkedin|telegram|email|зв[\u2019']?яз|зв'яз|контакт|співпрац|найм|пропозиц|созвон|связ|сотруднич|контак|предлож)/i;
const CONTACT_FLOW_YES_REGEX =
  /^(yes|y|sure|ok|okay|start|go|так|да|звісно|ок|добре|хочу|давай|tak|si|sí|ja|oui|sim)$/i;
const CONTACT_FLOW_NO_REGEX = /^(no|n|not now|cancel|ні|нет|не|nope|nah|nie|nein)$/i;
const RESUME_INTENT_REGEX =
  /(resume|cv|curriculum|скачать.*(резюме|cv)|резюме|завантаж.*(резюме|cv)|життєпис|pobierz.*(cv|resume)|lebenslauf|currículum|descargar.*(cv|currículum)|изтегл.*(cv|резюме))/i;
const CONTACT_SKIP_REGEX =
  /^(skip|no|none|without|пропустити|пропустить|ні|нет|не потрібно|не нужно|пропусни|без|няма|n\/a)$/i;
const CONTACT_CANCEL_REGEX =
  /^(cancel|stop|abort|скасувати|стоп|відміна|отмена|откажи|отказ|прекрати)$/i;
const ASSISTANT_TYPING_DELAY_MS = 320;

const createInitialContactFlowState = (): ContactFlowState => ({
  active: false,
  step: 'name',
  name: '',
  contact: '',
  proposal: '',
  callTime: null,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const renderMessageContent = (content: string) => {
  const parts = content.split(URL_SPLIT_REGEX);

  return parts.map((part, index) => {
    if (URL_PART_REGEX.test(part)) {
      const match = part.match(/^(https?:\/\/\S*?)([.,!?;:]+)?$/);
      const cleanUrl = match?.[1] ?? part;
      const trailingPunctuation = match?.[2] ?? '';

      return (
        <span key={`link-wrap-${index}`}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-[#1d4ed8] underline decoration-[#1d4ed8]/50 underline-offset-2 transition-colors hover:text-[#1e40af]"
          >
            {cleanUrl}
          </a>
          {trailingPunctuation && <span>{trailingPunctuation}</span>}
        </span>
      );
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
};

export const AskBohdanChat = () => {
  const t = useTranslations('common.askBohdan');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactFlow, setContactFlow] = useState<ContactFlowState>(createInitialContactFlowState());
  const [awaitingContactFlowConsent, setAwaitingContactFlowConsent] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<ScenarioCategoryId | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  const scenarioCategories = useMemo(
    () => [
      { id: 'about' as const, label: t('categories.about') },
      { id: 'projects' as const, label: t('categories.projects') },
      { id: 'tech' as const, label: t('categories.tech') },
      { id: 'experience' as const, label: t('categories.experience') },
      { id: 'contact' as const, label: t('categories.contact') },
    ],
    [t],
  );

  const scenarioTopics = useMemo<Record<ScenarioCategoryId, ScenarioTopic[]>>(
    () => ({
      about: [
        { id: 'focus', label: t('starters.focus'), question: t('starters.focus') },
        { id: 'english', label: t('starters.english'), question: t('starters.english') },
        { id: 'strengths', label: t('starters.aboutStrengths'), question: t('starters.aboutStrengths') },
        { id: 'roleFit', label: t('starters.aboutRoleFit'), question: t('starters.aboutRoleFit') },
      ],
      projects: [
        { id: 'projects', label: t('starters.projects'), question: t('starters.projects') },
        { id: 'bookPortfolio', label: t('starters.projectBookPortfolio'), question: t('starters.projectBookPortfolio') },
        { id: 'skillHub', label: t('starters.projectSkillHub'), question: t('starters.projectSkillHub') },
        { id: 'ticketing', label: t('starters.projectTicketing'), question: t('starters.projectTicketing') },
        { id: 'pharmacyApi', label: t('starters.projectPharmacyApi'), question: t('starters.projectPharmacyApi') },
      ],
      tech: [
        { id: 'tech', label: t('starters.tech'), question: t('starters.tech') },
        { id: 'frontend', label: t('starters.techFrontend'), question: t('starters.techFrontend') },
        { id: 'backend', label: t('starters.techBackend'), question: t('starters.techBackend') },
        { id: 'mobile', label: t('starters.techMobile'), question: t('starters.techMobile') },
        { id: 'ai', label: t('starters.techAi'), question: t('starters.techAi') },
        { id: 'devops', label: t('starters.techDevops'), question: t('starters.techDevops') },
      ],
      experience: [
        { id: 'experience', label: t('starters.experience'), question: t('starters.experience') },
        { id: 'artadian', label: t('starters.expArtadian'), question: t('starters.expArtadian') },
        { id: 'silinexx', label: t('starters.expSilinexx'), question: t('starters.expSilinexx') },
        { id: 'wnet', label: t('starters.expWnet'), question: t('starters.expWnet') },
        { id: 'growth', label: t('starters.expGrowth'), question: t('starters.expGrowth') },
      ],
      contact: [
        { id: 'contact', label: t('starters.contact'), question: t('starters.contact') },
        { id: 'hiring', label: t('starters.contactHiring'), question: t('starters.contactHiring') },
        { id: 'timezone', label: t('starters.contactTimezone'), question: t('starters.contactTimezone') },
        { id: 'availability', label: t('starters.contactAvailability'), question: t('starters.contactAvailability') },
        { id: 'resumeDownload', label: t('starters.resumeDownload'), question: t('starters.resumeDownload') },
      ],
    }),
    [t],
  );

  const selectedCategory = useMemo(
    () => scenarioCategories.find((item) => item.id === selectedCategoryId) ?? null,
    [scenarioCategories, selectedCategoryId],
  );

  const topicOptions = selectedCategoryId ? scenarioTopics[selectedCategoryId] : [];

  const selectedTopic = useMemo(
    () => topicOptions.find((item) => item.id === selectedTopicId) ?? null,
    [topicOptions, selectedTopicId],
  );

  const resetContactFlow = () => setContactFlow(createInitialContactFlowState());

  const showAssistantMessages = async (baseMessages: ChatMessage[], nextMessages: ChatMessage[]) => {
    setIsLoading(true);
    await wait(ASSISTANT_TYPING_DELAY_MS);
    setMessages([...baseMessages, ...nextMessages]);
    setIsLoading(false);
  };

  const startContactFlow = async (curMessages: ChatMessage[]) => {
    setAwaitingContactFlowConsent(false);
    setContactFlow({
      active: true,
      step: 'name',
      name: '',
      contact: '',
      proposal: '',
      callTime: null,
    });

    await showAssistantMessages(curMessages, [
      {
        role: 'assistant',
        content: `${t('contactFlow.intro')}\n\n${t('contactFlow.askName')}`,
      },
    ]);
  };

  const sendContactsAndOfferFlow = async (curMessages: ChatMessage[]) => {
    setAwaitingContactFlowConsent(true);
    await showAssistantMessages(curMessages, [
      {
        role: 'assistant',
        content: t('contactFlow.contactDirectInfo', {
          email: links.ownerEmail,
          phone: links.ownerPhone,
          telegram: links.ownerTelegram,
        }),
      },
      {
        role: 'assistant',
        content: t('contactFlow.contactFlowOffer'),
      },
    ]);
  };

  const submitContactRequest = async (flow: ContactFlowState) => {
    const res = await fetch('/api/contact-request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: flow.name,
        contact: flow.contact,
        proposal: flow.proposal,
        callTime: flow.callTime,
      }),
    });

    const data = (await res.json()) as ContactApiSuccess | ContactApiError;
    if (!res.ok || !data.ok) {
      throw new Error(data.ok ? 'Unexpected response' : data.error);
    }
  };

  const evaluateContactInputWithAI = async (step: ContactFlowStep, value: string) => {
    const res = await fetch('/api/contact-flow-eval', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        step,
        userInput: value,
        name: contactFlow.name,
        contact: contactFlow.contact,
        proposal: contactFlow.proposal,
      }),
    });

    const data = (await res.json()) as ContactFlowEvalSuccess | ContactFlowEvalError;
    if (!res.ok || !data.ok) {
      throw new Error(data.ok ? 'Unexpected response' : data.error);
    }

    return data.result;
  };

  const evaluateContactIntentWithAI = async (value: string) => {
    const res = await fetch('/api/contact-intent-eval', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userInput: value }),
    });

    const data = (await res.json()) as ContactIntentEvalSuccess | ContactIntentEvalError;
    if (!res.ok || !data.ok) {
      throw new Error(data.ok ? 'Unexpected response' : data.error);
    }

    return data.result;
  };

  const evaluateContactFlowConsentWithAI = async (value: string) => {
    const res = await fetch('/api/contact-flow-consent-eval', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userInput: value }),
    });

    const data = (await res.json()) as ContactFlowConsentEvalSuccess | ContactFlowConsentEvalError;
    if (!res.ok || !data.ok) {
      throw new Error(data.ok ? 'Unexpected response' : data.error);
    }

    return data.result;
  };

  const handleContactFlowAnswer = async (userInput: string, baseMessages: ChatMessage[]) => {
    const value = userInput.trim();

    if (CONTACT_CANCEL_REGEX.test(value)) {
      resetContactFlow();
      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: t('contactFlow.cancelled') },
      ]);
      return;
    }

    let evaluation: Awaited<ReturnType<typeof evaluateContactInputWithAI>>;
    try {
      setIsLoading(true);
      evaluation = await evaluateContactInputWithAI(contactFlow.step, value);
    } catch {
      evaluation = {
        status: 'valid',
        normalizedValue: value,
      };
    }

    if (evaluation.status === 'cancel') {
      resetContactFlow();
      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: t('contactFlow.cancelled') },
      ]);
      return;
    }

    if (evaluation.status === 'abusive') {
      resetContactFlow();
      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: t('contactFlow.abusive') },
      ]);
      return;
    }

    const normalizedValue = (evaluation.normalizedValue ?? value).trim();

    if (evaluation.status === 'invalid') {
      const invalidMessageByStep: Record<ContactFlowStep, string> = {
        name: t('contactFlow.invalidName'),
        contact: t('contactFlow.invalidContact'),
        proposal: t('contactFlow.invalidProposal'),
        callTime: t('contactFlow.askCallTime'),
      };

      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: invalidMessageByStep[contactFlow.step] },
      ]);
      return;
    }

    if (contactFlow.step === 'name') {
      if (normalizedValue.length < 2) {
        await showAssistantMessages(baseMessages, [
          { role: 'assistant', content: t('contactFlow.invalidName') },
        ]);
        return;
      }

      setContactFlow((cur) => ({ ...cur, step: 'contact', name: normalizedValue }));
      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: t('contactFlow.askContact') },
      ]);
      return;
    }

    if (contactFlow.step === 'contact') {
      const looksLikeContact = normalizedValue.length >= 5 && /[@+]|https?:\/\//.test(normalizedValue);
      if (!looksLikeContact) {
        await showAssistantMessages(baseMessages, [
          { role: 'assistant', content: t('contactFlow.invalidContact') },
        ]);
        return;
      }

      setContactFlow((cur) => ({ ...cur, step: 'proposal', contact: normalizedValue }));
      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: t('contactFlow.askProposal') },
      ]);
      return;
    }

    if (contactFlow.step === 'proposal') {
      if (normalizedValue.length < 10) {
        await showAssistantMessages(baseMessages, [
          { role: 'assistant', content: t('contactFlow.invalidProposal') },
        ]);
        return;
      }

      setContactFlow((cur) => ({ ...cur, step: 'callTime', proposal: normalizedValue }));
      await showAssistantMessages(baseMessages, [
        { role: 'assistant', content: t('contactFlow.askCallTime') },
      ]);
      return;
    }

    if (contactFlow.step === 'callTime') {
      const callTime = CONTACT_SKIP_REGEX.test(normalizedValue) ? null : normalizedValue;
      const completedFlow: ContactFlowState = {
        ...contactFlow,
        callTime,
      };

      setIsLoading(true);
      try {
        await submitContactRequest(completedFlow);
        resetContactFlow();
        setMessages([
          ...baseMessages,
          { role: 'assistant', content: t('contactFlow.success') },
        ]);
      } catch (err) {
        setMessages([
          ...baseMessages,
          {
            role: 'assistant',
            content: err instanceof Error ? `${t('contactFlow.error')}: ${err.message}` : t('contactFlow.error'),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendResumeDownloadMessage = async (baseMessages: ChatMessage[]) => {
    await showAssistantMessages(baseMessages, [
      {
        role: 'assistant',
        content: t('resumeCtaText'),
        action: {
          type: 'download-cv',
          href: links.ownerCvFile,
          label: t('resumeCtaButton'),
        },
      },
      {
        role: 'assistant',
        content: `${t('resumeCtaAltText')} ${links.ownerCvGoogle}`,
      },
    ]);
  };

  const sendQuestion = async (rawQuestion: string, options?: SendQuestionOptions) => {
    const question = rawQuestion.trim();
    if (!question || isLoading) return;

    if (options?.bypassContactFlow) {
      resetContactFlow();
      setAwaitingContactFlowConsent(false);
    }

    const next: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setError(null);

    if (awaitingContactFlowConsent && !options?.bypassContactFlow) {
      if (CONTACT_FLOW_YES_REGEX.test(question)) {
        await startContactFlow(next);
        return;
      }

      if (CONTACT_FLOW_NO_REGEX.test(question)) {
        setAwaitingContactFlowConsent(false);
        await showAssistantMessages(next, [
          { role: 'assistant', content: t('contactFlow.contactFlowConsentDeclined') },
        ]);
        return;
      }

      try {
        setIsLoading(true);
        const aiConsent = await evaluateContactFlowConsentWithAI(question);

        if (aiConsent.decision === 'accept') {
          await startContactFlow(next);
          return;
        }

        if (aiConsent.decision === 'decline') {
          setAwaitingContactFlowConsent(false);
          await showAssistantMessages(next, [
            { role: 'assistant', content: t('contactFlow.contactFlowConsentDeclined') },
          ]);
          return;
        }
      } catch {
        // Fall back to contact intent detection below.
      }

      // If user asks about contact again, repeat direct contacts + offer flow.
      let consentPhaseContactIntentDetected = CONTACT_INTENT_REGEX.test(question);
      if (!consentPhaseContactIntentDetected) {
        try {
          setIsLoading(true);
          const aiIntent = await evaluateContactIntentWithAI(question);
          consentPhaseContactIntentDetected = aiIntent.intent === 'contact';
        } catch {
          // Fall through to normal handling when intent evaluator is unavailable.
        }
      }

      if (consentPhaseContactIntentDetected) {
        await sendContactsAndOfferFlow(next);
        return;
      }

      // For any other message, stop waiting for consent and process normally.
      setAwaitingContactFlowConsent(false);
    }

    if (contactFlow.active && !options?.bypassContactFlow) {
      await handleContactFlowAnswer(question, next);
      return;
    }

    let contactIntentDetected = options?.bypassContactFlow ? false : CONTACT_INTENT_REGEX.test(question);
    if (!contactIntentDetected && !options?.bypassContactFlow) {
      try {
        setIsLoading(true);
        const aiIntent = await evaluateContactIntentWithAI(question);
        contactIntentDetected = aiIntent.intent === 'contact';
      } catch {
        // Keep regex-only detection when AI evaluator is unavailable.
      }
    }
    const shouldForceContactFlow = options?.forceContactFlow === true;

    if (shouldForceContactFlow || contactIntentDetected) {
      if (shouldForceContactFlow) {
        await startContactFlow(next);
      } else {
        await sendContactsAndOfferFlow(next);
      }
      return;
    }

    const resumeIntentDetected = RESUME_INTENT_REGEX.test(question);
    if (resumeIntentDetected) {
      await sendResumeDownloadMessage(next);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/rag-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question,
          history: messages.slice(-10),
          scenario:
            selectedCategory && selectedCategoryId
              ? {
                categoryId: selectedCategoryId,
                categoryLabel: selectedCategory.label,
                topicId: selectedTopic?.id ?? null,
                topicLabel: selectedTopic?.label ?? null,
              }
              : null,
        }),
      });
      const data = (await res.json()) as ApiSuccess | ApiError;
      if (!res.ok || !data.ok) throw new Error(data.ok ? 'Unexpected response' : data.error);

      setMessages((cur) => [...cur, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendQuestion(input);
  };

  const handleSelectCategory = (categoryId: ScenarioCategoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedTopicId(null);
  };

  const handleSelectTopic = (topic: ScenarioTopic) => {
    setSelectedTopicId(topic.id);
    const shouldUseContactFlow = topic.id === 'contact';
    void sendQuestion(topic.question, shouldUseContactFlow ? undefined : { bypassContactFlow: true });
  };

  const clearScenario = () => {
    setSelectedCategoryId(null);
    setSelectedTopicId(null);
    resetContactFlow();
  };

  useEffect(() => {
    const h = () => setIsOpen(true);
    window.addEventListener('open-ask-bohdan', h);
    return () => window.removeEventListener('open-ask-bohdan', h);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      className="fixed z-[9999] flex flex-col items-end gap-3"
      style={{
        right: 'calc(env(safe-area-inset-right) + clamp(0.75rem, 2vw, 3rem))',
        bottom: 'calc(env(safe-area-inset-bottom) + clamp(0.75rem, 2vw, 3rem))',
      }}
    >
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="ask-bohdan-panel"
            aria-label={t('aria.chatPanel')}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ originX: 1, originY: 1 }}
            className={[
              'flex flex-col overflow-hidden',
              'w-[calc(100vw-3rem)] max-w-[400px]',
              'h-[min(40rem,calc(100dvh-6.5rem))]',
              'rounded-3xl',
              'border border-[--border-medium]',
              'bg-[--surface-1]',
              'shadow-[var(--shadow-popup)]',
            ].join(' ')}
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-[--border-subtle] px-4 py-3">
              {/* Spinning badge */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full p-[1.5px]">
                <span
                  className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                  style={{ background: SPIN_BG }}
                />
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[--surface-1]">
                  <BsChatTextFill className="h-[14px] w-[14px] text-[#CBACF9]" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[--text-secondary]">
                  {t('assistantLabel')}
                </p>
                <h2 className="truncate text-sm font-semibold text-[--text-primary]">
                  {t('title')}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t('aria.closeChat')}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[--border-subtle] text-[--text-secondary] transition-colors hover:border-[--border-medium] hover:text-[--text-primary]"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </header>

            {/* Chips */}
            <div className="border-b border-[--border-subtle] px-4 py-2.5">
              <motion.p
                layout
                className="mb-2 text-[10px] uppercase tracking-widest text-[--text-secondary]"
              >
                {selectedCategoryId ? t('scenario.pickTopic') : t('scenario.pickCategory')}
              </motion.p>

              <AnimatePresence mode="wait" initial={false}>
                {!selectedCategoryId ? (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible"
                  >
                    {scenarioCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleSelectCategory(category.id)}
                        className="h-full w-[72%] max-w-[220px] shrink-0 rounded-xl border border-[--border-subtle] bg-[--surface-2] px-3 py-2 text-left text-[11px] font-medium leading-snug text-[--text-secondary] transition-colors hover:border-[--border-medium] hover:text-[--text-primary] sm:w-full sm:max-w-none"
                      >
                        <span className="flex items-start gap-2">
                          <span className="text-sm leading-none">{CATEGORY_ICONS[category.id]}</span>
                          <span>{category.label}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="topics"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-[--text-secondary]">
                        {selectedCategory?.label}
                      </p>
                      <button
                        type="button"
                        onClick={clearScenario}
                        className="rounded-md border border-[--border-subtle] px-2 py-1 text-[10px] uppercase tracking-wider text-[--text-secondary] transition-colors hover:border-[--border-medium] hover:text-[--text-primary]"
                      >
                        {t('scenario.back')}
                      </button>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible">
                      {topicOptions.map((topic) => (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => handleSelectTopic(topic)}
                          className="h-full w-[82%] max-w-[300px] shrink-0 rounded-xl border border-[--border-subtle] bg-[--surface-2] px-3 py-2 text-left text-[11px] leading-snug text-[--text-secondary] transition-colors hover:border-[--border-medium] hover:text-[--text-primary] sm:w-full sm:max-w-none"
                        >
                          <span className="flex items-start gap-2">
                            <span className="text-sm leading-none">{TOPIC_ICONS[topic.id] ?? '💬'}</span>
                            <span>{topic.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="min-h-[140px] flex-1 overflow-y-auto p-4 sm:h-[320px] sm:max-h-[360px] sm:min-h-[180px]"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full p-[1.5px]">
                    <span
                      className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                      style={{ background: SPIN_BG }}
                    />
                    <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[--surface-2]">
                      <BsChatTextFill className="h-5 w-5 text-[#CBACF9]" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[--text-primary]">
                      {t('emptyStateTitle')}
                    </p>
                    <p className="mt-1 text-xs text-[--text-secondary]">
                      {t('emptyStateSubtitle')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg, i) =>
                    msg.role === 'user' ? (
                      <div
                        key={`u-${i}`}
                        className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm leading-relaxed text-white"
                        style={{ background: 'linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)' }}
                      >
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        key={`a-${i}`}
                        className="max-w-[88%] rounded-2xl rounded-bl-sm border border-[--border-subtle] bg-[--surface-2] px-3.5 py-2.5 text-sm leading-relaxed text-[--text-primary]"
                      >
                        <div className="space-y-2">
                          <div>{renderMessageContent(msg.content)}</div>
                          {msg.action?.type === 'download-cv' && (
                            <a
                              href={msg.action.href}
                              download
                              className="inline-flex items-center justify-center rounded-lg border border-[#1d4ed8]/45 bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                            >
                              {msg.action.label}
                            </a>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-1.5 px-1 pt-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#CBACF9]"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t border-[--border-subtle] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                disabled={isLoading}
                className="min-h-10 min-w-0 flex-1 rounded-xl border border-[--border-subtle] bg-[--surface-2] px-3.5 py-2 text-sm text-[--text-primary] outline-none placeholder:text-[--text-secondary] transition-colors focus:border-[#CBACF9]/50"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label={t('send')}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#1d4ed8]/55 bg-[#2563eb] px-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-all hover:bg-[#1d4ed8] active:scale-[0.98] dark:border-[#7c3aed]/35 dark:bg-[linear-gradient(135deg,#6d28d9_0%,#4f46e5_100%)] dark:hover:brightness-110 dark:shadow-[0_8px_20px_rgba(79,70,229,0.35)] disabled:cursor-not-allowed disabled:border-[--border-medium] disabled:bg-[--surface-3] disabled:text-[--text-secondary] disabled:shadow-none sm:px-3.5"
              >
                <BsSendFill className="h-3.5 w-3.5" />
                <span className="max-[390px]:hidden">{t('send')}</span>
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <div className="group relative">
        {!isOpen && (
          <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 max-w-[min(20rem,calc(100vw-1rem))] rounded-2xl border border-[--border-medium] bg-[--surface-1] px-3 py-1.5 text-left text-xs font-medium text-[#1d4ed8] opacity-0 shadow-[var(--shadow-card)] transition-opacity group-hover:opacity-100 dark:text-[--text-primary]">
            {t('triggerHint')}
          </span>
        )}

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="ask-bohdan-panel"
          aria-label={isOpen ? t('aria.closeChat') : t('aria.openChat')}
          onClick={() => setIsOpen((v) => !v)}
          className="relative h-14 w-14 overflow-hidden rounded-full p-[1.5px] transition-transform hover:scale-105 active:scale-95 sm:w-auto sm:rounded-full"
        >
          <span
            className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]"
            style={{ background: SPIN_BG }}
          />
          <span
            className="relative flex h-full w-full items-center justify-center gap-2 rounded-full border border-[--border-subtle] sm:px-4"
            style={{ background: 'linear-gradient(180deg,var(--surface-1) 0%,var(--surface-2) 100%)' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.18 }}
                >
                  <HiXMark className="h-6 w-6 text-[--text-primary]" />
                </motion.span>
              ) : (
                <motion.span
                  key="chat"
                  initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.18 }}
                >
                  <BsChatTextFill className="h-5 w-5 text-[#6d28d9] dark:text-[#CBACF9]" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden text-sm font-medium text-[#1d4ed8] dark:text-[--text-primary] sm:inline">
              {isOpen ? t('aria.closeChat') : t('title')}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
