import { useState } from "react";
import { Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PredictionForm from "@/components/PredictionForm";
import DetailedAnalysis from "@/components/DetailedAnalysis";
import FeatureImportanceChart from "@/components/FeatureImportanceChart";
import RiskAssessment from "@/components/RiskAssessment";
import WhatIfAnalysis from "@/components/WhatIfAnalysis";
import HealthRecommendations from "@/components/HealthRecommendations";
import PredictionHistory from "@/components/PredictionHistory";
import AIAdvisor from "@/components/AIAdvisor";
import ModelInfo from "@/components/ModelInfo";

export interface PredictionData {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  BMI: number;
  Age: number;
}

const Index = () => {
  const [currentPrediction, setCurrentPrediction] = useState<PredictionData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePredictionComplete = (data: PredictionData) => {
    setCurrentPrediction(data);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Activity className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Advanced Diabetes Analytics Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive ML-powered health screening with AI insights, risk assessment, and personalized recommendations
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="prediction" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 mb-8">
            <TabsTrigger value="prediction">Prediction</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="whatif">What-If</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="ai">AI Advisor</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="risk">Risk Map</TabsTrigger>
            <TabsTrigger value="model">Model Info</TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="animate-fade-in">
            <PredictionForm onPredictionComplete={handlePredictionComplete} />
          </TabsContent>

          <TabsContent value="analysis" className="animate-fade-in">
            {currentPrediction ? (
              <DetailedAnalysis predictionData={currentPrediction} />
            ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Complete a prediction first to view detailed analysis</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="whatif" className="animate-fade-in">
            {currentPrediction ? (
              <WhatIfAnalysis initialData={currentPrediction} />
            ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Complete a prediction first to run what-if scenarios</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="animate-fade-in">
            {currentPrediction ? (
              <HealthRecommendations predictionData={currentPrediction} />
            ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Complete a prediction first to get personalized recommendations</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <PredictionHistory refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="ai" className="animate-fade-in">
            <AIAdvisor currentPrediction={currentPrediction} />
          </TabsContent>

          <TabsContent value="features" className="animate-fade-in">
            <FeatureImportanceChart />
          </TabsContent>

          <TabsContent value="risk" className="animate-fade-in">
            {currentPrediction ? (
              <RiskAssessment predictionData={currentPrediction} />
            ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Complete a prediction first to view risk assessment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="model" className="animate-fade-in">
            <ModelInfo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
