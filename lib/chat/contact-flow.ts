import type { ContactFlowProgress, ContactFlowStep } from '@/lib/chat/types';

// A typed message skips the model only when it is nothing but the word. The legacy chat matched substrings (hire, call,
// email, telegram, meet...) to offer the request form, which is fine for an offer and wrong for an answer: "Tell me about
// the Telegram bot he built" and "Can he meet deadlines?" are questions for the model, which adds the card itself.
export const BARE_CONTACT_REGEX = /^[\s"'«(]*(?:contacts?|contacto|kontakt|контакт(?:ы|и|ів|ов)?)[\s.!?)"'»]*$/iu;
export const BARE_RESUME_REGEX =
  /^[\s"'«(]*(?:cv|resume|résumé|curriculum(?:\s+vitae)?|currículum|lebenslauf|резюме|життєпис)[\s.!?)"'»]*$/iu;

// The skip and cancel words and the step rules below are the legacy chat's (components/ask-bohdan-chat.tsx), except that
// a contact also counts when it is a phone number without "+" or a link without "https://": the step asks for both.
const CONTACT_SKIP_REGEX =
  /^(skip|no|none|without|пропустити|пропустить|ні|нет|не потрібно|не нужно|пропусни|без|няма|n\/a)$/i;
const CONTACT_CANCEL_REGEX =
  /^(cancel|stop|abort|скасувати|стоп|відміна|отмена|откажи|отказ|прекрати)$/i;
const CONTACT_METHOD_REGEX = /[@+]|https?:\/\/|\b(?:t\.me|telegram\.me|linkedin\.com|wa\.me|github\.com)\//i;
const PHONE_MIN_DIGITS = 7;

const looksLikeContact = (value: string) =>
  value.length >= 5 && (CONTACT_METHOD_REGEX.test(value) || value.replace(/\D/g, '').length >= PHONE_MIN_DIGITS);

const FLOW_STEPS: readonly ContactFlowStep[] = ['name', 'contact', 'proposal', 'callTime'];

export type ContactDraft = {
  name: string;
  contact: string;
  proposal: string;
  callTime: string | null;
};

export type ContactFlowState = { step: ContactFlowStep; draft: ContactDraft };

/** Keys under `common.askBohdan.contactFlow` that the steps answer with. */
export type ContactFlowMessageKey =
  | 'askContact'
  | 'askProposal'
  | 'askCallTime'
  | 'invalidName'
  | 'invalidContact'
  | 'invalidProposal'
  | 'cancelled'
  | 'abusive';

export type ContactStepOutcome =
  | { type: 'cancelled' }
  | { type: 'abusive' }
  | { type: 'retry'; messageKey: ContactFlowMessageKey }
  | { type: 'next'; flow: ContactFlowState; messageKey: ContactFlowMessageKey }
  | { type: 'complete'; draft: ContactDraft };

type Evaluation = { status: string; normalizedValue?: string };

const INVALID_MESSAGE: Record<ContactFlowStep, ContactFlowMessageKey> = {
  name: 'invalidName',
  contact: 'invalidContact',
  proposal: 'invalidProposal',
  callTime: 'askCallTime'
};

export const createContactFlow = (): ContactFlowState => ({
  step: 'name',
  draft: { name: '', contact: '', proposal: '', callTime: null }
});

export const getFlowProgress = (flow: ContactFlowState): ContactFlowProgress => ({
  step: flow.step,
  index: FLOW_STEPS.indexOf(flow.step) + 1,
  total: FLOW_STEPS.length
});

// The evaluator is a nicety: when it fails the answer counts as valid, as in the legacy chat.
const evaluateWithServer = async (
  flow: ContactFlowState,
  value: string,
  signal: AbortSignal
): Promise<Evaluation> => {
  try {
    const response = await fetch('/api/contact-flow-eval', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        step: flow.step,
        userInput: value,
        name: flow.draft.name,
        contact: flow.draft.contact,
        proposal: flow.draft.proposal
      }),
      signal
    });
    const body = (await response.json()) as { ok?: unknown; result?: Partial<Evaluation> | null } | null;
    const result = body?.result;

    if (!response.ok || body?.ok !== true || typeof result?.status !== 'string') {
      throw new Error('Unexpected response');
    }

    return {
      status: result.status,
      normalizedValue: typeof result.normalizedValue === 'string' ? result.normalizedValue : undefined
    };
  } catch {
    return { status: 'valid', normalizedValue: value };
  }
};

/** One answer of the four-step contact request: cancel/abuse/invalid handling, then the step's own rule. */
export const evaluateContactStep = async (
  flow: ContactFlowState,
  input: string,
  signal: AbortSignal
): Promise<ContactStepOutcome> => {
  const value = input.trim();

  if (CONTACT_CANCEL_REGEX.test(value)) return { type: 'cancelled' };

  const evaluation = await evaluateWithServer(flow, value, signal);

  if (evaluation.status === 'cancel') return { type: 'cancelled' };
  if (evaluation.status === 'abusive') return { type: 'abusive' };

  const normalized = (evaluation.normalizedValue ?? value).trim();

  if (evaluation.status === 'invalid') return { type: 'retry', messageKey: INVALID_MESSAGE[flow.step] };

  switch (flow.step) {
    case 'name':
      if (normalized.length < 2) return { type: 'retry', messageKey: 'invalidName' };

      return {
        type: 'next',
        flow: { step: 'contact', draft: { ...flow.draft, name: normalized } },
        messageKey: 'askContact'
      };
    case 'contact':
      if (!looksLikeContact(normalized)) {
        return { type: 'retry', messageKey: 'invalidContact' };
      }

      return {
        type: 'next',
        flow: { step: 'proposal', draft: { ...flow.draft, contact: normalized } },
        messageKey: 'askProposal'
      };
    case 'proposal':
      if (normalized.length < 10) return { type: 'retry', messageKey: 'invalidProposal' };

      return {
        type: 'next',
        flow: { step: 'callTime', draft: { ...flow.draft, proposal: normalized } },
        messageKey: 'askCallTime'
      };
    case 'callTime':
      return {
        type: 'complete',
        draft: { ...flow.draft, callTime: CONTACT_SKIP_REGEX.test(normalized) ? null : normalized }
      };
  }
};

/** Throws when the request did not reach Bohdan. Not abortable: once it is on its way, aborting cannot take it back. */
export const submitContactRequest = async (draft: ContactDraft): Promise<void> => {
  const response = await fetch('/api/contact-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(draft)
  });
  const body = (await response.json().catch(() => null)) as { ok?: unknown } | null;

  if (!response.ok || body?.ok !== true) throw new Error('Contact request failed');
};
