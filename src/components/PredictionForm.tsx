import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PredictionData } from "@/pages/Index";

const API_BASE_URL = "http://127.0.0.1:8000";

interface PredictionResult {
  prediction: string;
  probability: number;
  risk_score: number;
  confidence_level: string;
}

interface PredictionFormProps {
  onPredictionComplete: (data: PredictionData) => void;
}

const PredictionForm = ({ onPredictionComplete }: PredictionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PredictionData>({
    Pregnancies: 0,
    Glucose: 0,
    BloodPressure: 0,
    BMI: 0,
    Age: 0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.Pregnancies && formData.Pregnancies !== 0) {
      setError("All fields are required");
      return false;
    }

    if (formData.Pregnancies < 0 || formData.Pregnancies > 20) {
      setError("Pregnancies must be between 0 and 20");
      return false;
    }
    if (formData.Glucose < 0 || formData.Glucose > 300) {
      setError("Glucose must be between 0 and 300 mg/dL");
      return false;
    }
    if (formData.BloodPressure < 0 || formData.BloodPressure > 200) {
      setError("Blood Pressure must be between 0 and 200 mmHg");
      return false;
    }
    if (formData.BMI < 10 || formData.BMI > 70) {
      setError("BMI must be between 10 and 70");
      return false;
    }
    if (formData.Age < 1 || formData.Age > 120) {
      setError("Age must be between 1 and 120");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data: PredictionResult = await response.json();
      setResult(data);
      onPredictionComplete(formData);
      
      toast({
        title: "Prediction Complete",
        description: data.prediction === "Diabetic"
          ? "Risk detected. Please consult a healthcare professional." 
          : "Low risk detected. Continue healthy habits!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to API";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Pregnancies: 0,
      Glucose: 0,
      BloodPressure: 0,
      BMI: 0,
      Age: 0,
    });
    setResult(null);
    setError("");
  };

  const isDiabetic = result?.prediction === "Diabetic";

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Prediction Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Health Metrics</CardTitle>
          <CardDescription>
            Provide your health data for comprehensive diabetes risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Pregnancies">Number of Pregnancies</Label>
              <Input
                id="Pregnancies"
                name="Pregnancies"
                type="number"
                min="0"
                max="20"
                value={formData.Pregnancies}
                onChange={handleInputChange}
                placeholder="e.g., 2"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Glucose">Glucose Level (mg/dL)</Label>
              <Input
                id="Glucose"
                name="Glucose"
                type="number"
                step="0.1"
                min="0"
                max="300"
                value={formData.Glucose}
                onChange={handleInputChange}
                placeholder="e.g., 130"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="BloodPressure">Blood Pressure (mmHg)</Label>
              <Input
                id="BloodPressure"
                name="BloodPressure"
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={formData.BloodPressure}
                onChange={handleInputChange}
                placeholder="e.g., 70"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="BMI">Body Mass Index (BMI)</Label>
              <Input
                id="BMI"
                name="BMI"
                type="number"
                step="0.1"
                min="10"
                max="70"
                value={formData.BMI}
                onChange={handleInputChange}
                placeholder="e.g., 28.5"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Age">Age (years)</Label>
              <Input
                id="Age"
                name="Age"
                type="number"
                min="1"
                max="120"
                value={formData.Age}
                onChange={handleInputChange}
                placeholder="e.g., 45"
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Get Prediction"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <div className="space-y-6">
        {result && (
          <Card className={`shadow-lg border-2 ${isDiabetic ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {isDiabetic ? (
                  <div className="p-3 bg-destructive/20 rounded-full">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                ) : (
                  <div className="p-3 bg-success/20 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">
                    {isDiabetic ? "High Risk Detected" : "Low Risk"}
                  </CardTitle>
                  <CardDescription>
                    Confidence: {result.confidence_level}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-semibold">{result.risk_score}%</span>
                </div>
                <Progress value={result.risk_score} className="h-3" />
              </div>

              <div className="p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Probability</p>
                </div>
                <p className="text-2xl font-bold">{(result.probability * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isDiabetic ? "Likelihood of diabetes" : "Likelihood of being non-diabetic"}
                </p>
              </div>

              <Alert className={isDiabetic ? "border-destructive/50" : "border-success/50"}>
                <AlertDescription className="text-sm">
                  {isDiabetic ? (
                    <>
                      <strong>Recommendation:</strong> The model indicates elevated risk factors. 
                      Please consult with a healthcare professional for proper diagnosis and guidance.
                    </>
                  ) : (
                    <>
                      <strong>Great news!</strong> The model shows low risk indicators. 
                      Continue maintaining healthy lifestyle habits.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1 text-primary">🎯 Accuracy</h4>
              <p className="text-muted-foreground">93.2% accuracy with F1-score of 0.880</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-primary">🔬 Algorithm</h4>
              <p className="text-muted-foreground">Random Forest Classifier</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-primary">📊 Dataset</h4>
              <p className="text-muted-foreground">Pima Indians Diabetes Database</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionForm;
