import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { PredictionData } from "@/pages/Index";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = "http://127.0.0.1:8000";

interface DetailedPrediction {
  prediction: string;
  probability: number;
  risk_score: number;
  confidence_level: string;
  feature_contributions: Record<string, number>;
  risk_factors: string[];
  recommendations: string[];
  timestamp: string;
}

interface DetailedAnalysisProps {
  predictionData: PredictionData;
}

const DetailedAnalysis = ({ predictionData }: DetailedAnalysisProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DetailedPrediction | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDetailedPrediction = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`${API_BASE_URL}/predict/detailed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(predictionData),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch detailed analysis");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedPrediction();
  }, [predictionData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error || "No data available"}</AlertDescription>
      </Alert>
    );
  }

  const isDiabetic = data.prediction === "Diabetic";

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
      {/* Main Result Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Detailed Analysis Report</CardTitle>
              <CardDescription>Generated on {new Date(data.timestamp).toLocaleString()}</CardDescription>
            </div>
            <Badge variant={isDiabetic ? "destructive" : "default"} className="text-lg px-4 py-2">
              {data.prediction}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
              <p className="text-3xl font-bold text-primary">{data.risk_score}%</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Probability</p>
              <p className="text-3xl font-bold text-accent">{(data.probability * 100).toFixed(2)}%</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Confidence</p>
              <p className="text-3xl font-bold">{data.confidence_level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Feature Contributions
          </CardTitle>
          <CardDescription>How each factor influenced the prediction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.feature_contributions)
            .sort(([, a], [, b]) => b - a)
            .map(([feature, contribution]) => (
              <div key={feature} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{feature}</span>
                  <span className="text-muted-foreground">{contribution.toFixed(1)}%</span>
                </div>
                <Progress value={contribution} className="h-2" />
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Identified Risk Factors
          </CardTitle>
          <CardDescription>Key health concerns detected</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.risk_factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="mt-1">
                  {factor.includes("No significant") ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <span className="text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>Health improvement suggestions based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {data.recommendations.map((rec, index) => {
              const [category, ...rest] = rec.split("] ");
              const recommendation = rest.join("] ");
              const categoryClean = category.replace("[", "");

              return (
                <Alert key={index}>
                  <AlertDescription>
                    <span className="font-semibold text-primary">{categoryClean}:</span> {recommendation}
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedAnalysis;
