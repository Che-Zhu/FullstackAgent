"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Save, Key } from "lucide-react";

interface EnvVariable {
  id?: string;
  key: string;
  value: string;
}

export default function EnvironmentPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEnvironmentVariables();
  }, [projectId]);

  const fetchEnvironmentVariables = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/environment`);
      const data = await response.json();

      // Load all general environment variables
      const generalVars = data.general || [];
      setEnvVars(generalVars);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching environment variables:", error);
      toast.error("Failed to load environment variables");
      setLoading(false);
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: keyof EnvVariable, value: any) => {
    const updated = [...envVars];
    updated[index] = { ...updated[index], [field]: value };
    setEnvVars(updated);
  };

  const saveEnvironment = async () => {
    setSaving(true);

    // Only save general environment variables
    const allVars: EnvVariable[] = envVars.filter(env => env.key && env.value);

    try {
      const response = await fetch(`/api/projects/${projectId}/environment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variables: allVars }),
      });

      if (!response.ok) {
        throw new Error("Failed to save environment variables");
      }

      toast.success("Environment variables saved successfully");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error saving environment variables:", error);
      toast.error("Failed to save environment variables");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Environment Variables</h1>
          <p className="text-gray-400">Configure custom environment variables for your application</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              Custom Environment Variables
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add your application-specific environment variables. For authentication and payment configurations, use their dedicated pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {envVars.map((env, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <Input
                  placeholder="KEY"
                  value={env.key}
                  onChange={(e) => updateEnvVar(index, "key", e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  className="bg-gray-800 border-gray-700 text-white font-mono col-span-4"
                />
                <Input
                  placeholder="Value"
                  value={env.value}
                  onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white col-span-7"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeEnvVar(index)}
                  className="border-gray-700 text-white hover:bg-gray-800 col-span-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {envVars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No custom environment variables configured yet
              </div>
            )}
            <Button
              onClick={addEnvVar}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Variable
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={saveEnvironment}
            disabled={saving}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Environment"}
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}