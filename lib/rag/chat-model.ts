import { ChatOpenAI } from '@langchain/openai';

export const CHAT_MODEL = 'gpt-6-luna';

// gpt-6-luna is a reasoning model: it rejects `temperature`, `max_tokens` and takes
// `reasoning_effort` / `max_completion_tokens` instead. @langchain/openai only treats o-series
// and gpt-5 as reasoning models, so for luna it would drop `reasoning_effort` and send
// `max_tokens`. These params therefore go through `modelKwargs`, which is spread into the
// request body as-is.
//
// The ceiling must stay generous: reasoning tokens count against it, and a low one starves
// the visible answer.
export const createChatModel = () =>
  new ChatOpenAI({
    model: CHAT_MODEL,
    modelKwargs: {
      reasoning_effort: 'low',
      max_completion_tokens: 8000
    }
  });
