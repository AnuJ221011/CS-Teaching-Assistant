import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Code, Database, Cpu, Globe, Settings, BookOpen,
  ChartPie,
  ChartBar
} from 'lucide-react';

const CSTeachingAssistant = () => {
  const initialMessage = {
    id: 1,
    role: 'assistant',
    content:
      "Hello! I'm your CS Teaching Assistant. I'm here to help you with Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, Full Stack Web Development, Machine Learning and AI, Data Analysis, and programming in C++, Java, and Python. What would you like to learn today?",
    timestamp: new Date().toISOString(),
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('https://cs-teaching-assistant.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          chatHistory: chatHistory,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
  };

  const formatContent = (content) => {
    let formatted = content;

    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    formatted = formatted.replace(codeBlockRegex, (match, language, code) => {
      return `<div class="code-block-wrapper">
        ${language ? `<div class="code-language">${language}</div>` : ''}
        <pre class="code-block"><code>${code.trim()}</code></pre>
      </div>`;
    });

    const inlineCodeRegex = /`([^`]+)`/g;
    formatted = formatted.replace(inlineCodeRegex, (match, code) => {
      return `<code class="inline-code">${code}</code>`;
    });

    const boldRegex = /\*\*(.*?)\*\*/g;
    formatted = formatted.replace(boldRegex, '<strong>$1</strong>');

    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    formatted = formatted.replace(headerRegex, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="response-header">${text}</h${level}>`;
    });

    const listRegex = /^[-*+]\s+(.+)$/gm;
    formatted = formatted.replace(listRegex, '<li class="response-list-item">$1</li>');

    formatted = formatted.replace(/(<li class="response-list-item">.*?<\/li>)(\s*<li class="response-list-item">.*?<\/li>)*/g, (match) => {
      return `<ul class="response-list">${match}</ul>`;
    });

    const numberedListRegex = /^\d+\.\s+(.+)$/gm;
    formatted = formatted.replace(numberedListRegex, '<li class="response-list-item">$1</li>');

    formatted = formatted.replace(/\n\n/g, '<br><br>');
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };

  const quickTopics = [
    { icon: <Code className="w-4 h-4" />, label: 'Data Structures', query: 'Explain binary trees with examples' },
    { icon: <Database className="w-4 h-4" />, label: 'DBMS', query: 'What is database normalization?' },
    { icon: <Cpu className="w-4 h-4" />, label: 'Operating Systems', query: 'Explain process scheduling algorithms' },
    { icon: <Globe className="w-4 h-4" />, label: 'Networks', query: 'How does TCP/IP work?' },
    { icon: <Settings className="w-4 h-4" />, label: 'Full Stack Development', query: 'Explain MERN stack' },
    { icon: <ChartBar className="w-4 h-4" />, label: 'Machine Learning', query: 'What is supervised learning?' },
    { icon: <ChartPie className="w-4 h-4" />, label: 'Data Analysis', query: 'Explain data visualization' },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Algorithms', query: 'Explain sorting algorithms' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900  via-slate-700 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CS Teaching Assistant
              </h1>
              <p className="text-xs text-purple-300">Your AI companion for Computer Science learning</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-sm text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/20 transition-all duration-200"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        {messages.length <= 1 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-purple-300">Quick Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(topic.query)}
                  className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-purple-500/20 hover:border-purple-400/40 hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-purple-400 group-hover:text-purple-300 transition-colors">{topic.icon}</div>
                    <span className="text-sm font-medium">{topic.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-800 to-purple-800 text-white'
                      : 'bg-white text-gray-800 shadow-lg border border-gray-200'
                  }`}
                >
                  <div
                    className={`prose max-w-none ${
                      message.role === 'user' ? 'prose-invert' : 'prose-slate'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: formatContent(message.content),
                    }}
                  />
                </div>
                <div className="text-xs text-purple-300 mt-1 px-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center order-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="Ask about DSA, DBMS, OS, CN, FSD, ML, AI, DA, Programming in C++, Java, Python"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-purple-500/20 rounded-xl text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .code-block-wrapper {
          margin: 16px 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #2e2e2e;
          background: #000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .code-language {
          background: #111;
          color: #90cdf4;
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-transform: uppercase;
          border-bottom: 1px solid #2e2e2e;
        }
        .code-block {
          background: #34383dff;
          color: #f8f8f2;
          padding: 18px 16px;
          margin: 0;
          overflow-x: auto;
          font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          white-space: pre;
        }
        .code-block::-webkit-scrollbar {
          height: 8px;
        }
        .code-block::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        .code-block code {
          background: transparent;
          color: #f8f8f2;
          font-size: inherit;
          padding: 0;
        }
        .inline-code {
          background: blue;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 3px 6px;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 0.85rem;
          color: #f8f8f2;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default CSTeachingAssistant;
