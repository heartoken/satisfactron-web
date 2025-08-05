"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Clock, Trash2, Utensils } from "lucide-react";

type MealPeriod = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export default function MealPeriodsAdmin() {
  const [mealPeriods, setMealPeriods] = useState<MealPeriod[]>([]);
  const [newMeal, setNewMeal] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMealPeriods();
  }, []);

  const fetchMealPeriods = async () => {
    try {
      const response = await fetch("/api/meal-periods");
      if (response.ok) {
        const data = await response.json();
        setMealPeriods(data);
      } else {
        console.error("Failed to fetch meal periods: HTTP", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch meal periods:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.startTime || !newMeal.endTime) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/meal-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMeal.name,
          startTime: newMeal.startTime,
          endTime: newMeal.endTime,
        }),
      });

      if (response.ok) {
        setNewMeal({ name: "", startTime: "", endTime: "" });
        await fetchMealPeriods(); // Wait for the fetch to complete
      } else {
        console.error("Failed to create meal period: HTTP", response.status);
      }
    } catch (error) {
      console.error("Failed to create meal period:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    try {
      const response = await fetch(`/api/meal-periods/${mealId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update state by filtering out the deleted meal
        setMealPeriods(prev => prev.filter(meal => meal.id !== mealId));
      } else {
        console.error("Failed to delete meal period: HTTP", response.status);
      }
    } catch (error) {
      console.error("Failed to delete meal period:", error);
    }
  };

  return (
    <Suspense fallback={"loading..."}>


      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Administration
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            Meal Periods Management
          </h1>
          <p className="text-muted-foreground">
            Configure time slots for meal-based review analysis
          </p>
        </div>

        {/* Add New Meal Period */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Meal Period</CardTitle>
            <CardDescription>
              Define a new time slot for meals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Meal Name</Label>
                  <Input
                    id="name"
                    value={newMeal.name}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, name: e.target.value })
                    }
                    placeholder="e.g., Breakfast"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newMeal.startTime}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newMeal.endTime}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? "Adding..." : "Add Period"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Meal Periods */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Periods</CardTitle>
            <CardDescription>
              {mealPeriods.length} active meal period{mealPeriods.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mealPeriods.length > 0 ? (
              <div className="space-y-4">
                {mealPeriods.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Utensils className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{meal.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {meal.start_time} - {meal.end_time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(meal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Periods Configured
                </h3>
                <p className="text-muted-foreground">
                  Add your first meal period above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}