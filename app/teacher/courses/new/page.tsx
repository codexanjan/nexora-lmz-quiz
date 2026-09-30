"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowRight, Check, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NewCourseWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Basics
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");

  // Step 2: Objectives & Description
  const [description, setDescription] = useState("");

  // Step 3: Module & Lesson
  const [moduleTitle, setModuleTitle] = useState("Introduction & Fundamentals");
  const [lessonTitle, setLessonTitle] = useState("Course Overview & Objectives");
  const [lessonContent, setLessonContent] = useState(
    "Welcome to the course! In this introductory lesson, we will outline the syllabus roadmap, essential prerequisites, and core learning goals."
  );

  // Step 4: Enrollment settings
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [enrollmentLimit, setEnrollmentLimit] = useState("80");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Create course
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code,
          description,
          slug,
          enrollmentCode: enrollmentCode || undefined,
          enrollmentLimit: parseInt(enrollmentLimit) || 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");

      const createdCourseId = data.course.id;

      // 2. Create initial module
      const modRes = await fetch(`/api/courses/${createdCourseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: moduleTitle || "Module 1",
          orderIndex: 1,
        }),
      });

      const modData = await modRes.json();
      if (modRes.ok) {
        // 3. Create initial lesson
        await fetch(`/api/courses/${createdCourseId}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId: modData.module.id,
            title: lessonTitle || "Lesson 1",
            content: lessonContent || "Introductory content.",
            durationMinutes: 15,
            isRequired: true,
            orderIndex: 1,
          }),
        });
      }

      router.push("/teacher/courses");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep text-text-primary p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Cancel & Back to Courses
        </Link>

        {/* Wizard Stepper */}
        <div className="flex items-center justify-between px-2">
          {["Basics", "Curriculum", "Settings", "Review"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                  step > i + 1
                    ? "bg-success text-deep"
                    : step === i + 1
                    ? "bg-primary text-white ring-2 ring-primary-light"
                    : "bg-surface text-text-muted border border-white/10"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === i + 1 ? "text-white" : "text-text-muted"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs">
              {error}
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-heading text-text-primary">Course Identity</h2>
                <p className="text-xs text-text-secondary mt-1">Specify course naming and academic catalog codes</p>
              </div>

              <Input
                label="Course Title"
                placeholder="e.g. Distributed Computing & Cloud Infrastructure"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Course Code"
                  placeholder="e.g. CS-620"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <Input
                  label="URL Slug"
                  placeholder="e.g. distributed-computing"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  size="sm"
                  disabled={!title || !code}
                  onClick={() => setStep(2)}
                >
                  Next: Curriculum Outline <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum & Description */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-heading text-text-primary">Curriculum Objectives</h2>
                <p className="text-xs text-text-secondary mt-1">Provide an overview and initialize the first module</p>
              </div>

              <Textarea
                label="Course Description"
                rows={3}
                placeholder="Provide a comprehensive academic overview of topics covered..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="p-4 rounded-xl bg-surface/80 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-accent uppercase font-mono tracking-wider block">
                  Starter Module & First Lesson
                </span>
                <Input
                  label="Module 1 Title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  required
                />
                <Input
                  label="Lesson 1 Title"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button size="sm" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="sm"
                  disabled={!description || !moduleTitle || !lessonTitle}
                  onClick={() => setStep(3)}
                >
                  Next: Access Settings <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Enrollment Settings */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-heading text-text-primary">Enrollment & Capacity</h2>
                <p className="text-xs text-text-secondary mt-1">Configure student registration controls</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Custom Enrollment Code (Optional)"
                  placeholder="e.g. NX-DIST-2026"
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
                />
                <Input
                  label="Student Enrollment Limit"
                  type="number"
                  value={enrollmentLimit}
                  onChange={(e) => setEnrollmentLimit(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-secondary space-y-1">
                <span className="font-bold text-accent block">Enrollment Behavior</span>
                <p className="leading-relaxed">
                  Courses are created in <span className="font-semibold text-text-primary">DRAFT</span> state. Once you review your modules and quizzes, you can publish the course to immediately notify eligible students.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button size="sm" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="sm" onClick={() => setStep(4)}>
                  Review & Publish <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Finalize */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-heading text-text-primary">Course Verification</h2>
                <p className="text-xs text-text-secondary mt-1">Verify details before creating course workspace</p>
              </div>

              <div className="p-4 rounded-xl bg-surface/80 border border-white/10 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Title:</span>
                  <span className="text-text-primary font-bold">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Code:</span>
                  <span className="text-text-primary font-bold">{code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Initial Module:</span>
                  <span className="text-text-primary">{moduleTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Initial Lesson:</span>
                  <span className="text-text-primary">{lessonTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Enrollment Limit:</span>
                  <span className="text-text-primary">{enrollmentLimit} students</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button size="sm" variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateCourse}
                  isLoading={isLoading}
                  loadingText="Creating Course..."
                >
                  Create Course Workspace
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
