"use client";
import React, { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import "@/app/globals.css";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { ApiResponse } from "@/types/Apiresponse";

const SuggestBtn = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof messageSchema>>;
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const cleanupText = (text: string) => {
    try {
      const cleaned = text.replace(/\d+:/g, "").replace(/"/g, "");
      const jsonIndex = cleaned.indexOf("{");
      const cleanedText =
        jsonIndex !== -1 ? cleaned.substring(0, jsonIndex) : cleaned;

      return cleanedText
        .split("||")
        .map((q) => q.trim())
        .filter(
          (q) => q && !q.includes("finishReason") && !q.includes("usage")
        );
    } catch (err) {
      console.error("Error cleaning text:", err);
      return [];
    }
  };

  const handleClick = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/suggest-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const reader = response?.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const readResult = await reader?.read();
        if (!readResult) break;
        const { done, value } = readResult;
        if (done) break;

        result += decoder.decode(value);
      }

      const cleanedQuestions = cleanupText(result);
      setQuestions(cleanedQuestions);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="default"
        className="bg-gray-900 text-white hover:bg-gray-800"
      >
        {isLoading ? "Loading..." : "Suggest Messages"}
      </Button>

      {questions.length > 0 && (
        <p className="text-lg">Click on any message below to select it.</p>
      )}

      {error && <div className="text-red-500">Error: {error}</div>}

      {questions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl mb-4">Messages</h2>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  form.setValue("content", question);
                }}
              >
                <p className="text-gray-800">{question}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

function Page() {
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  const toast = useToast();
  const param = useParams<{ username: string }>();

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      const response = await axios.post("/api/send-message", {
        username: param.username,
        content: data.content,
      });
      toast.toast({
        title: "Message sent successfully",
        description: response.data.message,
      });
    } catch (error) {
      console.log("Error in verifying user");
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError?.response?.data?.message ?? "Error sending message";

      toast.toast({
        title: "Message sending failed",
        variant: "destructive",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">
        Public Profile Link
      </h1>

      <div className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">
                    Send Anonymous Message to @{param.username}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-base resize-none"
                      placeholder="Write your anonymous message here"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-gray-400 hover:bg-gray-500 text-white"
              >
                Send It
              </Button>
            </div>
          </form>
        </Form>

        <SuggestBtn form={form} />
      </div>
    </div>
  );
}

export default Page;
