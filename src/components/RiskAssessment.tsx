import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Activity, Heart, Scale, Droplet, Calendar } from "lucide-react";
import { PredictionData } from "@/pages/Index";

const API_BASE_URL = "http://127.0.0.1:8000";

interface RiskAssessmentData {
  feature: string;
  value: number;
  status: string;
  risk_level: string;
  normal_range: string;
}

interface RiskAssessmentProps {
  predictionData: PredictionData;
}

const featureIcons: Record<string, any> = {
  Glucose: Droplet,
  BMI: Scale,
  BloodPressure: Heart,
  Age: Calendar,
  Pregnancies: Activity,
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "High": return "destructive";
    case "Medium": return "default";
    case "Low": return "secondary";
    default: return "outline";
  }
};

const RiskAssessment = ({ predictionData }: RiskAssessmentProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RiskAssessmentData[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`${API_BASE_URL}/risk_assessment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(predictionData),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch risk assessment");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
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

  const highRiskCount = data.filter(d => d.risk_level === "High").length;
  const mediumRiskCount = data.filter(d => d.risk_level === "Medium").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Comprehensive Risk Assessment</CardTitle>
          <CardDescription>
            Detailed analysis of each health metric and its risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm">High Risk ({highRiskCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm">Medium Risk ({mediumRiskCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm">Low Risk ({data.length - highRiskCount - mediumRiskCount})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => {
          const Icon = featureIcons[item.feature] || Activity;
          const riskVariant = getRiskColor(item.risk_level);

          return (
            <Card key={item.feature} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      item.risk_level === "High" ? "bg-destructive/10" :
                      item.risk_level === "Medium" ? "bg-primary/10" :
                      "bg-success/10"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        item.risk_level === "High" ? "text-destructive" :
                        item.risk_level === "Medium" ? "text-primary" :
                        "text-success"
                      }`} />
                    </div>
                    <CardTitle className="text-lg">{item.feature}</CardTitle>
                  </div>
                  <Badge variant={riskVariant}>{item.risk_level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-3xl font-bold">{item.value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{item.status}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Normal Range</p>
                  <p className="font-medium">{item.normal_range}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> This assessment provides an overview of your health metrics compared 
          to standard ranges. Consult with healthcare professionals for personalized medical advice.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RiskAssessment;
