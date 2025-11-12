import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Brain, Database, Activity, TrendingUp } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

interface ModelMetadata {
  version: string;
  algorithm: string;
  training_date: string;
  metrics: {
    accuracy: number;
    f1_score: number;
    precision: number;
    recall: number;
  };
  required_features: string[];
}

interface APIStats {
  total_api_calls: number;
  endpoint_usage: Record<string, number>;
  total_predictions: number;
  timestamp: string;
}

const ModelInfo = () => {
  const [loading, setLoading] = useState(true);
  const [modelData, setModelData] = useState<ModelMetadata | null>(null);
  const [statsData, setStatsData] = useState<APIStats | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        const [modelResponse, statsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/model_info`),
          fetch(`${API_BASE_URL}/stats`),
        ]);

        if (!modelResponse.ok || !statsResponse.ok) {
          throw new Error("Failed to fetch model information");
        }

        const model = await modelResponse.json();
        const stats = await statsResponse.json();

        setModelData(model);
        setStatsData(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !modelData || !statsData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error || "No data available"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Brain className="w-8 h-8" />
            Model Information
          </CardTitle>
          <CardDescription>
            Comprehensive details about the deployed ML model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Algorithm</p>
              <p className="text-xl font-bold">{modelData.algorithm}</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Version</p>
              <p className="text-xl font-bold">{modelData.version}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Training Date</p>
              <p className="text-xl font-bold">{modelData.training_date}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Required Features</h4>
            <div className="flex flex-wrap gap-2">
              {modelData.required_features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-sm">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Model Performance Metrics
          </CardTitle>
          <CardDescription>
            Evaluation metrics from model training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
              <p className="text-4xl font-bold text-primary">
                {(modelData.metrics.accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">F1 Score</p>
              <p className="text-4xl font-bold text-accent">
                {modelData.metrics.f1_score.toFixed(3)}
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Precision</p>
              <p className="text-4xl font-bold text-success">
                {(modelData.metrics.precision * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Recall</p>
              <p className="text-4xl font-bold">
                {(modelData.metrics.recall * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <Alert className="mt-6">
            <AlertDescription className="text-sm">
              <strong>Performance Summary:</strong> The model demonstrates high accuracy ({(modelData.metrics.accuracy * 100).toFixed(1)}%) 
              with balanced precision and recall, indicating reliable predictions for both diabetic and non-diabetic cases.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            API Usage Statistics
          </CardTitle>
          <CardDescription>
            Real-time monitoring of API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total API Calls</p>
              <p className="text-3xl font-bold">{statsData.total_api_calls}</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
              <p className="text-3xl font-bold">{statsData.total_predictions}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Endpoint Usage</h4>
            <div className="space-y-2">
              {Object.entries(statsData.endpoint_usage)
                .sort(([, a], [, b]) => b - a)
                .map(([endpoint, count]) => (
                  <div key={endpoint} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="font-medium">{endpoint}</span>
                    <Badge variant="outline">{count} calls</Badge>
                  </div>
                ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(statsData.timestamp).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Backend</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• FastAPI (Python)</li>
                <li>• scikit-learn</li>
                <li>• Docker containerization</li>
                <li>• Kubernetes orchestration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Frontend</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• React + TypeScript</li>
                <li>• TailwindCSS</li>
                <li>• Recharts visualization</li>
                <li>• shadcn/ui components</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelInfo;
