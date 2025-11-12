import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Send, Sparkles, MessageSquare } from "lucide-react";
import { PredictionData } from "@/pages/Index";

interface AIAdvisorProps {
  currentPrediction: PredictionData | null;
}

const AIAdvisor = ({ currentPrediction }: AIAdvisorProps) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const quickPrompts = [
    "What dietary changes should I make to reduce diabetes risk?",
    "Can you create a 7-day meal plan for diabetes prevention?",
    "What exercises are best for managing blood sugar?",
    "Explain the relationship between BMI and diabetes",
    "What are the early warning signs of diabetes?",
  ];

  const handleSendMessage = () => {
    if (!prompt.trim()) return;

    setMessages([...messages, { role: "user", content: prompt }]);
    
    // Simulated AI response (in production, this would call Gemini API)
    setTimeout(() => {
      let response = "I'm an AI health advisor. ";
      
      if (currentPrediction) {
        response += `Based on your recent prediction with glucose level of ${currentPrediction.Glucose} and BMI of ${currentPrediction.BMI}, `;
      }
      
      response += "I recommend consulting with healthcare professionals for personalized advice. ";
      response += "Would you like specific guidance on diet, exercise, or monitoring?";

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 1000);

    setPrompt("");
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Bot className="w-8 h-8" />
            AI Health Advisor
          </CardTitle>
          <CardDescription>
            Get personalized health insights powered by AI (Note: Integrate with Gemini API for production)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Coming Soon:</strong> This feature will be powered by Google Gemini AI to provide 
              personalized health advice, meal plans, and answer your diabetes-related questions.
            </AlertDescription>
          </Alert>

          {/* Chat Messages */}
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto p-4 border rounded-lg bg-muted/20 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Start a conversation to get personalized health advice
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(qp)}
                  className="text-xs"
                >
                  {qp}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about diet, exercise, symptoms, or health management..."
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} size="icon" className="h-20 w-20">
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {currentPrediction && (
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Context:</strong> Using your latest prediction data (Glucose: {currentPrediction.Glucose}, 
                BMI: {currentPrediction.BMI}, BP: {currentPrediction.BloodPressure}) for personalized advice.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAdvisor;
