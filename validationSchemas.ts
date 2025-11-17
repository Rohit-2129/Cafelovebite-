import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z.string()
    .min(1, "Number of guests is required")
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 12;
    }, "Number of guests must be between 1 and 12"),
  message: z.string()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .or(z.literal(""))
});

export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  subject: z.string()
    .trim()
    .max(200, "Subject must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  message: z.string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters")
});

export const reviewSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  rating: z.number()
    .min(1, "Please select a rating")
    .max(5),
  review: z.string()
    .trim()
    .min(1, "Review is required")
    .max(1000, "Review must be less than 1000 characters")
});
