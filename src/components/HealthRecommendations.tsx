import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Heart, Apple, Dumbbell, Moon } from "lucide-react";
import { PredictionData } from "@/pages/Index";

const API_BASE_URL = "http://127.0.0.1:8000";

interface HealthRecommendation {
  category: string;
  recommendations: string[];
  priority: string;
}

interface HealthRecommendationsProps {
  predictionData: PredictionData;
}

const categoryIcons: Record<string, any> = {
  "Blood Sugar Management": Apple,
  "Weight Management": Dumbbell,
  "Blood Pressure": Heart,
  "General Health": Heart,
  "Diabetes Management": AlertTriangle,
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "High": return "destructive";
    case "Medium": return "default";
    default: return "secondary";
  }
};

const HealthRecommendations = ({ predictionData }: HealthRecommendationsProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthRecommendation[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`${API_BASE_URL}/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(predictionData),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [predictionData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Personalized Health Recommendations</CardTitle>
          <CardDescription>
            Evidence-based suggestions tailored to your health profile
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {data.map((item, index) => {
          const Icon = categoryIcons[item.category] || Heart;
          const priorityVariant = getPriorityVariant(item.priority);

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      item.priority === "High" ? "bg-destructive/10" :
                      item.priority === "Medium" ? "bg-primary/10" :
                      "bg-success/10"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        item.priority === "High" ? "text-destructive" :
                        item.priority === "Medium" ? "text-primary" :
                        "text-success"
                      }`} />
                    </div>
                    <CardTitle className="text-lg">{item.category}</CardTitle>
                  </div>
                  <Badge variant={priorityVariant}>
                    {item.priority} Priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {item.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex gap-3">
                      <div className="mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert>
        <Moon className="h-4 w-4" />
        <AlertDescription>
          <strong>Remember:</strong> Small, consistent changes lead to significant health improvements 
          over time. Start with one or two recommendations and gradually build healthy habits.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default HealthRecommendations;
