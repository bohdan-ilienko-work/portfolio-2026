import { Document } from '@langchain/core/documents';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatScenarioContext = {
  categoryId: string;
  categoryLabel: string;
  topicId: string | null;
  topicLabel: string | null;
};

type Source = {
  source: string;
  chunk: number;
};

const knowledgeBaseDir = path.join(process.cwd(), 'data', 'rag');

const ChatState = Annotation.Root({
  question: Annotation<string>(),
  scenario: Annotation<ChatScenarioContext | null>({
    reducer: (_, value) => value,
    default: () => null
  }),
  history: Annotation<ChatHistoryMessage[]>({
    reducer: (_, value) => value,
    default: () => []
  }),
  contextDocs: Annotation<Document[]>({
    reducer: (_, value) => value,
    default: () => []
  }),
  answer: Annotation<string>({
    reducer: (_, value) => value,
    default: () => ''
  }),
  sources: Annotation<Source[]>({
    reducer: (_, value) => value,
    default: () => []
  })
});

let retrieverCache:
  | {
    signature: string;
    promise: Promise<ReturnType<MemoryVectorStore['asRetriever']>>;
  }
  | null = null;

const getKnowledgeSignature = async () => {
  const files = await fs.readdir(knowledgeBaseDir);
  const supportedFiles = files
    .filter((file) => ['.md', '.txt', '.json'].includes(path.extname(file).toLowerCase()))
    .sort();

  const stats = await Promise.all(
    supportedFiles.map(async (fileName) => {
      const fullPath = path.join(knowledgeBaseDir, fileName);
      const stat = await fs.stat(fullPath);
      return `${fileName}:${stat.mtimeMs}`;
    })
  );

  return stats.join('|');
};

const readKnowledgeFiles = async () => {
  const files = await fs.readdir(knowledgeBaseDir);
  const supportedFiles = files.filter((file) =>
    ['.md', '.txt', '.json'].includes(path.extname(file).toLowerCase())
  );

  const docs: Document[] = [];

  for (const fileName of supportedFiles) {
    const fullPath = path.join(knowledgeBaseDir, fileName);
    const raw = await fs.readFile(fullPath, 'utf8');

    let content = raw;

    if (path.extname(fileName).toLowerCase() === '.json') {
      try {
        content = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        content = raw;
      }
    }

    docs.push(
      new Document({
        pageContent: content,
        metadata: { source: path.join('data', 'rag', fileName) }
      })
    );
  }

  return docs;
};

const buildRetriever = async () => {
  const docs = await readKnowledgeFiles();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 900,
    chunkOverlap: 120
  });

  const splitDocs = await splitter.splitDocuments(docs);
  const docsWithChunk = splitDocs.map((doc: Document, index: number) => {
    doc.metadata = {
      ...doc.metadata,
      chunk: index
    };

    return doc;
  });

  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const store = await MemoryVectorStore.fromDocuments(docsWithChunk, embeddings);

  return store.asRetriever(6);
};

const getRetriever = async () => {
  const signature = await getKnowledgeSignature();

  if (!retrieverCache || retrieverCache.signature !== signature) {
    retrieverCache = {
      signature,
      promise: buildRetriever()
    };
  }

  return retrieverCache.promise;
};

const retrieveNode = async (state: typeof ChatState.State) => {
  const retriever = await getRetriever();
  const retrievalQuery = [state.scenario?.categoryLabel, state.scenario?.topicLabel, state.question]
    .filter(Boolean)
    .join('\n');

  const docsFromQuestion = await retriever.invoke(state.question);

  const docsFromScenarioQuery =
    retrievalQuery && retrievalQuery !== state.question
      ? await retriever.invoke(retrievalQuery)
      : [];

  const mergedDocs = [...docsFromQuestion, ...docsFromScenarioQuery];
  const uniqueDocs = mergedDocs.filter((doc, index, self) => {
    const key = `${doc.metadata.source ?? 'unknown'}:${doc.metadata.chunk ?? -1}`;
    return (
      self.findIndex(
        (candidate) =>
          `${candidate.metadata.source ?? 'unknown'}:${candidate.metadata.chunk ?? -1}` === key
      ) === index
    );
  });

  const contextDocs = uniqueDocs.slice(0, 8);

  const sources = contextDocs.map((doc: Document) => ({
    source: String(doc.metadata.source ?? 'unknown'),
    chunk: Number(doc.metadata.chunk ?? -1)
  }));

  return { contextDocs, sources };
};

const generateNode = async (state: typeof ChatState.State) => {
  const model = new ChatOpenAI({
    model: 'gpt-4.1-mini',
    temperature: 0.2
  });

  const context = state.contextDocs
    .map((doc, index) => `Source ${index + 1}:\n${doc.pageContent}`)
    .join('\n\n');

  const historyText = state.history
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');

  const scenarioText = state.scenario
    ? `Category: ${state.scenario.categoryLabel}\nTopic: ${state.scenario.topicLabel || 'not selected yet'}`
    : 'No scenario selected.';

  const prompt = [
    'You are a personal assistant for Bohdan Ilienko.',
    'Name spelling rules are strict: English -> "Bohdan Ilienko", Russian -> "Богдан Ильенко", Ukrainian -> "Богдан Ільєнко".',
    'Never use these misspellings: "Иленко", "Илиенко".',
    'Answer only using the provided context.',
    'If information is missing, clearly say that the data is not in the knowledge base yet.',
    'Keep answers concise and factual.',
    '',
    'Conversation history:',
    historyText || 'No previous history.',
    '',
    'Selected scenario:',
    scenarioText,
    '',
    'Context:',
    context || 'No context found.',
    '',
    `User question: ${state.question}`
  ].join('\n');

  const response = await model.invoke(prompt);
  const answer = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  return { answer };
};

const graph = new StateGraph(ChatState)
  .addNode('retrieve', retrieveNode)
  .addNode('generate', generateNode)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'generate')
  .addEdge('generate', END)
  .compile();

export const runBohdanRag = async ({
  question,
  history,
  scenario
}: {
  question: string;
  history: ChatHistoryMessage[];
  scenario?: ChatScenarioContext | null;
}) => {
  const result = await graph.invoke({
    question,
    history,
    scenario: scenario ?? null
  });

  return {
    answer: result.answer,
    sources: result.sources
  };
};

export type { ChatHistoryMessage };
export type { ChatScenarioContext };
