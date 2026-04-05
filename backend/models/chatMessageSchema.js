const mongoose = require("mongoose");

/**
 * One message in the learning chatbot conversation.
 * Stored per-user (student or teacher) with subject context.
 * Supports RAG (Retrieval-Augmented Generation) with lecture references and sources.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      index: true,
    },
    // Subject context - identifies which subject the chat is about
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // For assistant messages: list of source documents/lectures referenced
    sources: [
      {
        type: String, // e.g., "Lecture_2024_03_15", "Document_Slide_Ch3"
        trim: true,
      }
    ],
    // For assistant messages: metadata about the response
    metadata: {
      lectureIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "lecture",
        }
      ],
      documentIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "document", // or whatever your document model is called
        }
      ],
      // Track which insights were generated for this message
      insightsProvided: [
        {
          topic: String,
          suggestion: String,
        }
      ],
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying by user + subject
chatMessageSchema.index({ student: 1, subject: 1, createdAt: -1 });
chatMessageSchema.index({ teacher: 1, subject: 1, createdAt: -1 });

module.exports = mongoose.model("chatMessage", chatMessageSchema);

