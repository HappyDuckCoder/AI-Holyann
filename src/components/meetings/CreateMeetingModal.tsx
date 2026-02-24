"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  AlignLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createConsultationEvent } from "@/actions/calendar";

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const meetingFormSchema = z
  .object({
    title: z.string().min(1, "Vui lòng nhập tiêu đề cuộc họp"),
    studentEmail: z
      .string()
      .min(1, "Vui lòng nhập email học viên")
      .email("Email không hợp lệ"),
    startDate: z.date(),
    startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
    endDate: z.date(),
    endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
    description: z.string().optional(),
    isCreateMeet: z.boolean(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const [startH, startM] = data.startTime.split(":").map(Number);
      start.setHours(startH, startM, 0, 0);

      const end = new Date(data.endDate);
      const [endH, endM] = data.endTime.split(":").map(Number);
      end.setHours(endH, endM, 0, 0);

      return end > start;
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endTime"],
    }
  );

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

// ============================================================
// COMPONENT
// ============================================================

interface CreateMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorEmail: string;
}

export default function CreateMeetingModal({
  open,
  onOpenChange,
  mentorEmail,
}: CreateMeetingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      studentEmail: "",
      startDate: new Date(),
      startTime: "09:00",
      endDate: new Date(),
      endTime: "10:00",
      description: "",
      isCreateMeet: true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchIsCreateMeet = watch("isCreateMeet");

  const onSubmit = async (data: MeetingFormValues) => {
    setIsSubmitting(true);

    try {
      // Tạo Date objects cho start và end time
      const startDateTime = new Date(data.startDate);
      const [startH, startM] = data.startTime.split(":").map(Number);
      startDateTime.setHours(startH, startM, 0, 0);

      const endDateTime = new Date(data.endDate);
      const [endH, endM] = data.endTime.split(":").map(Number);
      endDateTime.setHours(endH, endM, 0, 0);

      const result = await createConsultationEvent({
        title: data.title,
        description: data.description || "",
        startTime: startDateTime,
        endTime: endDateTime,
        mentorEmail: mentorEmail,
        studentEmail: data.studentEmail,
        isCreateMeet: data.isCreateMeet,
      });

      if (result.success) {
        toast.success("Đã tạo lịch tư vấn thành công!", {
          description: result.meetLink
            ? "Email mời đã được gửi cho học viên."
            : "Lịch đã được tạo.",
        });
        reset();
        onOpenChange(false);
      } else {
        toast.error("Không thể tạo lịch", {
          description: result.error || "Đã xảy ra lỗi",
        });
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Lỗi không xác định", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Thêm buổi tư vấn mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Title Input - Material Design style */}
          <div className="space-y-2">
            <Input
              {...register("title")}
              placeholder="Thêm tiêu đề"
              className="border-0 border-b-2 border-muted-foreground/30 bg-transparent px-0 text-lg font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:ring-0 focus-visible:ring-0"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Tabs - Event/Task (decorative) */}
          <div className="flex gap-2">
            <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
              Sự kiện
            </span>
            <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
              Nhiệm vụ
            </span>
          </div>

          {/* Date & Time Picker */}
          <div className="space-y-4">
            {/* Start */}
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-[160px] justify-start text-left font-normal",
                        !watchStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchStartDate ? (
                        format(watchStartDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchStartDate}
                      onSelect={(date) => {
                        if (date) {
                          setValue("startDate", date);
                          // Auto set end date = start date
                          setValue("endDate", date);
                        }
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="time"
                  {...register("startTime")}
                  className="w-[120px]"
                />
                <span className="text-muted-foreground">đến</span>
              </div>
            </div>

            {/* End */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5" /> {/* Spacer */}
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-[160px] justify-start text-left font-normal",
                        !watchEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchEndDate ? (
                        format(watchEndDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchEndDate}
                      onSelect={(date) => date && setValue("endDate", date)}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="time"
                  {...register("endTime")}
                  className="w-[120px]"
                />
              </div>
            </div>
            {errors.endTime && (
              <p className="pl-8 text-sm text-destructive">
                {errors.endTime.message}
              </p>
            )}
          </div>

          {/* Student Email */}
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <Input
                {...register("studentEmail")}
                placeholder="Email học viên"
                type="email"
              />
              {errors.studentEmail && (
                <p className="text-sm text-destructive">
                  {errors.studentEmail.message}
                </p>
              )}
            </div>
          </div>

          {/* Google Meet Toggle */}
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-1 items-center gap-2">
              <Checkbox
                id="create-meet"
                checked={watchIsCreateMeet}
                onCheckedChange={(checked: boolean) => setValue("isCreateMeet", checked)}
              />
              <Label htmlFor="create-meet" className="cursor-pointer">
                Thêm cuộc họp Google Meet
              </Label>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <AlignLeft className="mt-2 h-5 w-5 text-muted-foreground" />
            <Textarea
              {...register("description")}
              placeholder="Thêm mô tả"
              rows={3}
              className="flex-1 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
