import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { PredictionData } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://127.0.0.1:8000";

interface WhatIfResult {
  original_prediction: string;
  original_probability: number;
  modified_prediction: string;
  modified_probability: number;
  probability_change: number;
}

interface WhatIfAnalysisProps {
  initialData: PredictionData;
}

const WhatIfAnalysis = ({ initialData }: WhatIfAnalysisProps) => {
  const { toast } = useToast();
  const [selectedFeature, setSelectedFeature] = useState<string>("Glucose");
  const [newValue, setNewValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);

  const features = [
    { name: "Pregnancies", min: 0, max: 20, step: 1 },
    { name: "Glucose", min: 0, max: 300, step: 1 },
    { name: "BloodPressure", min: 0, max: 200, step: 1 },
    { name: "BMI", min: 10, max: 70, step: 0.1 },
    { name: "Age", min: 1, max: 120, step: 1 },
  ];

  const selectedFeatureInfo = features.find(f => f.name === selectedFeature);

  const handleAnalyze = async () => {
    if (!newValue) {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/what_if?modified_feature=${selectedFeature}&new_value=${newValue}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(initialData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to perform what-if analysis");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Analysis Complete",
        description: `Impact calculated for ${selectedFeature} change`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Analysis failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const probabilityChangePercent = result ? (result.probability_change * 100).toFixed(2) : "0";
  const isImprovement = result && result.probability_change < 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">What-If Analysis</CardTitle>
          <CardDescription>
            Explore how changes to your health metrics could affect your diabetes risk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Feature to Modify</Label>
                <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map((feature) => (
                      <SelectItem key={feature.name} value={feature.name}>
                        {feature.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newValue">
                  New {selectedFeature} Value
                  {selectedFeatureInfo && (
                    <span className="text-muted-foreground text-xs ml-2">
                      ({selectedFeatureInfo.min} - {selectedFeatureInfo.max})
                    </span>
                  )}
                </Label>
                <Input
                  id="newValue"
                  type="number"
                  min={selectedFeatureInfo?.min}
                  max={selectedFeatureInfo?.max}
                  step={selectedFeatureInfo?.step}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Enter new ${selectedFeature} value`}
                  disabled={loading}
                />
              </div>

              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Analysis"
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">Current Values</h4>
              <div className="space-y-2">
                {Object.entries(initialData).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex justify-between p-2 rounded ${
                      key === selectedFeature ? "bg-primary/10 font-semibold" : "bg-muted/50"
                    }`}
                  >
                    <span>{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Original Prediction</p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{result.original_prediction}</p>
                  <p className="text-sm text-muted-foreground">
                    {(result.original_probability * 100).toFixed(2)}% probability
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Modified Prediction</p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{result.modified_prediction}</p>
                  <p className="text-sm text-muted-foreground">
                    {(result.modified_probability * 100).toFixed(2)}% probability
                  </p>
                </div>
              </div>
            </div>

            <Alert className={`mt-6 ${isImprovement ? "border-success" : "border-destructive"}`}>
              <div className="flex items-center gap-2">
                {isImprovement ? (
                  <TrendingDown className="w-4 h-4 text-success" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                )}
                <AlertDescription>
                  <strong>Probability Change:</strong>{" "}
                  <span className={isImprovement ? "text-success" : "text-destructive"}>
                    {result && result.probability_change > 0 ? "+" : ""}{probabilityChangePercent}%
                  </span>
                  {" "}
                  {isImprovement
                    ? "Lowering this metric improves your risk profile"
                    : "This change increases diabetes risk"}
                </AlertDescription>
              </div>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatIfAnalysis;
