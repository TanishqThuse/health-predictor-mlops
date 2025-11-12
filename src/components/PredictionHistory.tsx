import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, History, TrendingUp, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://127.0.0.1:8000";

interface PredictionLog {
  timestamp: string;
  input: any;
  prediction: string;
  probability: number;
}

interface HistoryData {
  total_predictions: number;
  recent_predictions: PredictionLog[];
  timestamp: string;
}

interface PredictionHistoryProps {
  refreshTrigger: number;
}

const PredictionHistory = ({ refreshTrigger }: PredictionHistoryProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HistoryData | null>(null);
  const [error, setError] = useState<string>("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/history?limit=50`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleClearHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear history");
      }

      toast({
        title: "History Cleared",
        description: "All prediction logs have been removed",
      });

      fetchHistory();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

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

  if (!data || data.total_predictions === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <History className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No prediction history yet. Complete some predictions to see your history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.recent_predictions.map((log, index) => ({
    name: `#${index + 1}`,
    probability: (log.probability * 100).toFixed(2),
    timestamp: new Date(log.timestamp).toLocaleTimeString(),
  })).reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="w-8 h-8" />
                Prediction History
              </CardTitle>
              <CardDescription>
                Track your diabetes risk predictions over time
              </CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
              <p className="text-3xl font-bold">{data.total_predictions}</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Latest Prediction</p>
              <p className="text-3xl font-bold">
                {data.recent_predictions[data.recent_predictions.length - 1]?.prediction}
              </p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Avg Risk Score</p>
              <p className="text-3xl font-bold">
                {(
                  (data.recent_predictions.reduce((acc, log) => acc + log.probability, 0) /
                    data.recent_predictions.length) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Probability Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Diabetes Risk (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recent_predictions.slice().reverse().slice(0, 10).map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      log.prediction === "Diabetic"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                    }`}>
                      {log.prediction}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground">
                    <span>Glucose: {log.input.Glucose}</span>
                    <span>BMI: {log.input.BMI}</span>
                    <span>BP: {log.input.BloodPressure}</span>
                    <span>Age: {log.input.Age}</span>
                    <span>Preg: {log.input.Pregnancies}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{(log.probability * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionHistory;
