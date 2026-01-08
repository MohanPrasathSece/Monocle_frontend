import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { IntelligenceService } from '@/services/api';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hi! I'm Monocle AI. I can help you analyze your work threads, manage your schedule, or just chat about productivity. How can I help today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || !currentUser) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const history = messages.slice(1); // Exclude initial greeting
            const response = await IntelligenceService.chat(currentUser.id, userMessage, history);
            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? 'auto' : '500px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[350px] sm:w-[400px] pointer-events-auto"
                    >
                        <Card className="shadow-2xl border-primary/20 flex flex-col h-full overflow-hidden glass">
                            <CardHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <Bot className="w-5 h-5" />
                                    <CardTitle className="text-sm font-semibold">Monocle Intelligence</CardTitle>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                    >
                                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {!isMinimized && (
                                <>
                                    <CardContent className="flex-1 overflow-hidden p-0 bg-background/50">
                                        <div className="h-[380px] p-4 overflow-y-auto" ref={scrollRef}>
                                            <div className="space-y-4">
                                                {messages.map((m, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "flex gap-3 max-w-[85%]",
                                                            m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                            m.role === 'user' ? "bg-primary" : "bg-secondary"
                                                        )}>
                                                            {m.role === 'user' ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-secondary-foreground" />}
                                                        </div>
                                                        <div className={cn(
                                                            "rounded-2xl p-3 text-sm shadow-sm",
                                                            m.role === 'user'
                                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                : "bg-card border rounded-tl-none whitespace-pre-wrap"
                                                        )}>
                                                            <div className="prose prose-sm dark:prose-invert">
                                                                <ReactMarkdown>
                                                                    {m.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {isLoading && (
                                                    <div className="flex gap-3 mr-auto items-center">
                                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                            <Bot className="w-4 h-4 text-secondary-foreground" />
                                                        </div>
                                                        <div className="bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm">
                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-3 border-t bg-background/80">
                                        <form
                                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                            className="flex w-full items-center gap-2"
                                        >
                                            <Input
                                                placeholder="Type your message..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                className="flex-1"
                                                disabled={isLoading}
                                            />
                                            <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </CardFooter>
                                </>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="lg"
                className={cn(
                    "rounded-full w-14 h-14 shadow-xl flex items-center justify-center p-0 transition-all duration-300",
                    isOpen ? "rotate-90 scale-0" : "scale-100"
                )}
                onClick={() => setIsOpen(true)}
            >
                <MessageCircle className="w-6 h-6" />
            </Button>
        </div>
    );
}
