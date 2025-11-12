import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = "http://127.0.0.1:8000";

interface FeatureImportance {
  feature: string;
  importance: number;
}

const FeatureImportanceChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FeatureImportance[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchFeatureImportance = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`${API_BASE_URL}/feature_importance`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch feature importance");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureImportance();
  }, []);

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

  const maxImportance = Math.max(...data.map(d => d.importance));

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <BarChart3 className="w-8 h-8" />
            Feature Importance Analysis
          </CardTitle>
          <CardDescription>
            Understanding which health metrics have the strongest impact on diabetes prediction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.map((item, index) => {
            const percentage = (item.importance / maxImportance) * 100;
            const displayPercentage = (item.importance * 100).toFixed(2);
            
            return (
              <div key={item.feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-destructive' :
                      index === 1 ? 'bg-primary' :
                      index === 2 ? 'bg-accent' :
                      'bg-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-semibold text-lg">{item.feature}</span>
                  </div>
                  <span className="text-muted-foreground font-medium">{displayPercentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
                <p className="text-xs text-muted-foreground pl-11">
                  {item.feature === "Glucose" && "Blood sugar levels are the strongest predictor of diabetes risk"}
                  {item.feature === "BMI" && "Body mass index significantly affects metabolic health"}
                  {item.feature === "Age" && "Age is a key demographic risk factor"}
                  {item.feature === "BloodPressure" && "Blood pressure indicates cardiovascular health"}
                  {item.feature === "Pregnancies" && "Pregnancy history can affect diabetes risk"}
                </p>
              </div>
            );
          })}

          <Alert className="mt-6">
            <AlertDescription>
              <strong>Interpretation:</strong> Features with higher importance have a greater influence 
              on the model's predictions. Glucose levels typically show the highest importance in diabetes 
              prediction models.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureImportanceChart;
