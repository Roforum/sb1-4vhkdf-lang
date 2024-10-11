import dotenv from 'dotenv';
import { Crew, Agent, Task } from 'crewai';
import { OllamaAPI } from 'ollama';
import { processInput } from './inputProcessor.js';
import { generateArticle } from './articleGenerator.js';
import { postToWordPress } from './wordpressPublisher.js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const ollama = new OllamaAPI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
});

const taskManager = new Agent({
  name: 'Task Manager',
  goal: 'Coordinate and manage the overall process',
  backstory: 'An efficient AI coordinator that ensures smooth operation of the entire workflow.',
  llm: ollama.createCompletion({ model: 'llama3.2:1b' }),
});

const researcher = new Agent({
  name: 'Researcher',
  goal: 'Gather and analyze information from various sources',
  backstory: 'A meticulous AI researcher with a keen eye for detail and fact-checking abilities.',
  llm: ollama.createCompletion({ model: 'llama3.1:latest' }),
});

const writer = new Agent({
  name: 'Writer',
  goal: 'Create well-structured, SEO-optimized articles in the specified language',
  backstory: 'A multilingual AI writer with expertise in crafting engaging and informative content.',
  llm: ollama.createCompletion({ model: 'taozhiyuai/llama-3-8b-lexi-uncensored:f16' }),
});

const imageAnalyzer = new Agent({
  name: 'Image Analyzer',
  goal: 'Analyze and describe images and media content',
  backstory: 'An AI expert in visual analysis and interpretation of images and media.',
  llm: ollama.createCompletion({ model: 'bakllava:latest' }),
});

const crew = new Crew({
  agents: [taskManager, researcher, writer, imageAnalyzer],
  tasks: [
    new Task('Process input and gather data', async () => {
      const inputData = await processInput();
      return inputData;
    }),
    new Task('Research and analyze data', async (inputData) => {
      // Implement research and analysis logic
      return inputData.map(item => ({
        ...item,
        analysis: `Analysis for ${item.type} content`
      }));
    }),
    new Task('Generate article', async (researchResults) => {
      const language = process.env.ARTICLE_LANGUAGE || 'en';
      return Promise.all(researchResults.map(result => generateArticle(result, language)));
    }),
    new Task('Analyze images', async (articles) => {
      // Implement image analysis logic
      return articles.map(article => ({
        ...article,
        imageAnalysis: 'Image analysis placeholder'
      }));
    }),
    new Task('Post to WordPress', async (analyzedArticles) => {
      for (const article of analyzedArticles) {
        await postToWordPress(article);
      }
    }),
  ],
});

// ... (restul codului rămâne neschimbat)