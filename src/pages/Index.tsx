import { useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface PredictionData {
  Pregnancies: string;
  Glucose: string;
  BloodPressure: string;
  BMI: string;
  Age: string;
}

interface PredictionResult {
  diabetic: boolean;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PredictionData>({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    BMI: "",
    Age: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.Pregnancies || !formData.Glucose || !formData.BloodPressure || !formData.BMI || !formData.Age) {
      setError("All fields are required");
      return false;
    }

    const pregnancies = parseInt(formData.Pregnancies);
    const glucose = parseFloat(formData.Glucose);
    const bloodPressure = parseFloat(formData.BloodPressure);
    const bmi = parseFloat(formData.BMI);
    const age = parseInt(formData.Age);

    if (pregnancies < 0 || pregnancies > 20) {
      setError("Pregnancies must be between 0 and 20");
      return false;
    }
    if (glucose < 0 || glucose > 300) {
      setError("Glucose must be between 0 and 300 mg/dL");
      return false;
    }
    if (bloodPressure < 0 || bloodPressure > 200) {
      setError("Blood Pressure must be between 0 and 200 mmHg");
      return false;
    }
    if (bmi < 10 || bmi > 70) {
      setError("BMI must be between 10 and 70");
      return false;
    }
    if (age < 1 || age > 120) {
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
        body: JSON.stringify({
          Pregnancies: parseInt(formData.Pregnancies),
          Glucose: parseFloat(formData.Glucose),
          BloodPressure: parseFloat(formData.BloodPressure),
          BMI: parseFloat(formData.BMI),
          Age: parseInt(formData.Age),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data: PredictionResult = await response.json();
      setResult(data);
      
      toast({
        title: "Prediction Complete",
        description: data.diabetic 
          ? "Risk detected. Please consult a healthcare professional." 
          : "Low risk detected. Continue healthy habits!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to API. Make sure the backend is running at http://127.0.0.1:8000";
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
      Pregnancies: "",
      Glucose: "",
      BloodPressure: "",
      BMI: "",
      Age: "",
    });
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Activity className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Diabetes Risk Predictor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced ML-powered health screening using Random Forest Classification
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Prediction Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Enter Health Metrics</CardTitle>
              <CardDescription>
                Provide your health data for diabetes risk assessment
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
              <Card className={`shadow-lg border-2 ${result.diabetic ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {result.diabetic ? (
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
                        {result.diabetic ? "High Risk Detected" : "Low Risk"}
                      </CardTitle>
                      <CardDescription>
                        Model Prediction Result
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">Classification</p>
                    <p className="text-xl font-semibold">
                      {result.diabetic ? "Diabetic Risk Positive" : "Diabetic Risk Negative"}
                    </p>
                  </div>

                  <Alert className={result.diabetic ? "border-destructive/50" : "border-success/50"}>
                    <AlertDescription className="text-sm">
                      {result.diabetic ? (
                        <>
                          <strong>Recommendation:</strong> The model indicates elevated risk factors. 
                          Please consult with a healthcare professional for proper diagnosis and guidance. 
                          Early intervention can make a significant difference.
                        </>
                      ) : (
                        <>
                          <strong>Great news!</strong> The model shows low risk indicators. 
                          Continue maintaining healthy lifestyle habits including balanced diet, 
                          regular exercise, and routine health checkups.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
                    <strong>Disclaimer:</strong> This prediction is generated by a machine learning model 
                    and should not replace professional medical advice. Always consult healthcare providers 
                    for accurate diagnosis and treatment.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">About This Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1 text-primary">🤖 ML Model</h4>
                  <p className="text-muted-foreground">
                    Random Forest Classifier trained on Pima Indians Diabetes Dataset
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-primary">📊 Input Factors</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Pregnancy history</li>
                    <li>Blood glucose levels</li>
                    <li>Blood pressure readings</li>
                    <li>Body Mass Index (BMI)</li>
                    <li>Age demographics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-primary">⚙️ Technology Stack</h4>
                  <p className="text-muted-foreground">
                    FastAPI • Docker • Kubernetes • React • TailwindCSS
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
