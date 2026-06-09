"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, SendHorizonal } from "lucide-react";

import { submitTicketSchema, type SubmitTicketInput } from "@/lib/schemas/ticket";
import { submitTicketAction } from "@/app/actions/tickets";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DEPARTMENTS = [
  "IT", "HR", "Finance", "Operations", "Sales",
  "Marketing", "Legal", "Engineering", "Customer Support", "Other",
];

const URGENCY_LEVELS = [
  { value: "low", label: "Low — No immediate impact" },
  { value: "medium", label: "Medium — Some impact on work" },
  { value: "high", label: "High — Significant impact" },
  { value: "critical", label: "Critical — Work completely blocked" },
];

export function TicketForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubmitTicketInput>({
    resolver: zodResolver(submitTicketSchema),
    defaultValues: { urgency_level: "medium", department: "" as SubmitTicketInput["department"] },
  });

  const urgencyValue = watch("urgency_level");
  const departmentValue = watch("department");

  async function onSubmit(data: SubmitTicketInput) {
    setServerError(null);
    const result = await submitTicketAction(data);

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    toast.success("Ticket submitted successfully!");
    router.push(`/success?ticket=${result.data!.ticket_number}&id=${result.data!.ticket_id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contact Information</CardTitle>
          <CardDescription>Who should we reach out to about this ticket?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Jane Smith"
              {...register("full_name")}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@company.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="department">
              Department <span className="text-destructive">*</span>
            </Label>
            <Select
              value={departmentValue || ""}
              onValueChange={(v) => setValue("department", v as SubmitTicketInput["department"], { shouldValidate: true })}
            >
              <SelectTrigger id="department" aria-invalid={!!errors.department}>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" disabled>Select your department</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-xs text-destructive">{errors.department.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issue Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Issue Details</CardTitle>
          <CardDescription>Describe your issue as clearly as possible for faster resolution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of the issue"
              {...register("subject")}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Detailed Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. Include steps to reproduce, error messages, and what you expected to happen..."
              rows={6}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Information</CardTitle>
          <CardDescription>Optional details that help us prioritize and route your ticket.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="urgency_level">Urgency Level</Label>
            <Select
              value={urgencyValue}
              onValueChange={(v) => setValue("urgency_level", v as SubmitTicketInput["urgency_level"])}
            >
              <SelectTrigger id="urgency_level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_LEVELS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="affected_system">Affected System</Label>
            <Input
              id="affected_system"
              placeholder="e.g. Salesforce, Jira, VPN"
              {...register("affected_system")}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="attachment_url">Attachment URL</Label>
            <Input
              id="attachment_url"
              type="url"
              placeholder="https://drive.google.com/... or similar link"
              {...register("attachment_url")}
            />
            {errors.attachment_url && (
              <p className="text-xs text-destructive">{errors.attachment_url.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload your file to Google Drive, Dropbox, or similar, then paste the link here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Required fields
        </p>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <SendHorizonal className="mr-2 h-4 w-4" />
              Submit Ticket
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
