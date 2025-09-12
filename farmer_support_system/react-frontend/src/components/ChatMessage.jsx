import React from 'react';
import { Bot, User, Volume2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/cn';

const ChatMessage = ({ 
  message, 
  index, 
  isTyping, 
  onTypingComplete, 
  onTextToSpeech, 
  ttsLoading, 
  typingMessageIndex 
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn(
      "group flex gap-4 px-4 py-6 transition-colors hover:bg-gray-50/50",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
        isUser 
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
          : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      )}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "inline-block max-w-4xl rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
          isUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-md hover:shadow-md"
        )}>
          {isAssistant && isTyping ? (
            <TypingMessage
              content={message.content}
              isTyping={typingMessageIndex === index}
              onTypingComplete={onTypingComplete}
              isUser={isUser}
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => (
                    <strong className={cn("font-semibold", isUser ? "text-white" : "text-emerald-700")}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className={cn("italic", isUser ? "text-blue-100" : "text-gray-700")}>
                      {children}
                    </em>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  code: ({ children }) => (
                    <code className={cn(
                      "px-2 py-1 rounded text-xs font-mono",
                      isUser 
                        ? "bg-blue-400/30 text-blue-100" 
                        : "bg-gray-100 text-gray-800"
                    )}>
                      {children}
                    </code>
                  ),
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Message Actions */}
        <div className={cn(
          "flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs text-gray-500 px-2">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Copy message"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          {/* Text-to-Speech Button for Assistant Messages */}
          {isAssistant && (
            <button
              onClick={() => onTextToSpeech(message.content, index)}
              disabled={ttsLoading[index] || typingMessageIndex === index}
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Read aloud"
            >
              {ttsLoading[index] ? (
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Typing animation component for AI messages
const TypingMessage = ({ content, isTyping, onTypingComplete, isUser }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [hasCompleted, setHasCompleted] = React.useState(false);
  const typingIntervalRef = React.useRef(null);

  React.useEffect(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    if (!isTyping || hasCompleted) {
      setDisplayedText(content);
      setCurrentIndex(content.length);
      return;
    }

    setDisplayedText('');
    setCurrentIndex(0);
    setHasCompleted(false);

    const startDelay = setTimeout(() => {
      typingIntervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          if (nextIndex > content.length) {
            clearInterval(typingIntervalRef.current);
            setHasCompleted(true);
            onTypingComplete && onTypingComplete();
            return content.length;
          }

          setDisplayedText(content.substring(0, nextIndex));
          return nextIndex;
        });
      }, 10);
    }, 100);

    return () => {
      clearTimeout(startDelay);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [content, isTyping, onTypingComplete, hasCompleted]);

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className={cn("font-semibold", isUser ? "text-white" : "text-emerald-700")}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={cn("italic", isUser ? "text-blue-100" : "text-gray-700")}>
              {children}
            </em>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ children }) => (
            <code className={cn(
              "px-2 py-1 rounded text-xs font-mono",
              isUser 
                ? "bg-blue-400/30 text-blue-100" 
                : "bg-gray-100 text-gray-800"
            )}>
              {children}
            </code>
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {isTyping && !hasCompleted && currentIndex < content.length && (
        <span className="animate-pulse text-emerald-400 ml-1 font-bold">|</span>
      )}
    </div>
  );
};

export default ChatMessage;