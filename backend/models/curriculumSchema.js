const mongoose = require("mongoose");

/**
 * Curriculum Schema
 * Stores curriculum information, chapters, lessons, and related documents
 * Organized for teacher's teaching management
 */

// Lesson Schema (embedded in Chapter)
const lessonSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    documentId: {
      type: String,
      default: null,
    },
    documentName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Chapter Schema (embedded in Curriculum)
const chapterSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
    lessons: [lessonSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Document Schema (embedded in Curriculum)
const documentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx", "pptx", "xlsx", "txt", "other"],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
  },
  { _id: true }
);

// Main Curriculum Schema
const curriculumSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    // References
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
      index: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subject",
      required: true,
      index: true,
    },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },

    // Content Organization
    chapters: [chapterSchema],

    documents: [documentSchema],

    // Status and Metadata
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    // Statistics
    totalChapters: {
      type: Number,
      default: 0,
    },

    totalLessons: {
      type: Number,
      default: 0,
    },

    totalDocuments: {
      type: Number,
      default: 0,
    },

    // Tags for searching and filtering
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Topics
    topics: [
      {
        type: String,
        trim: true,
      },
    ],

    // Access Control
    isPublished: {
      type: Boolean,
      default: false,
    },

    allowComments: {
      type: Boolean,
      default: true,
    },

    allowDownload: {
      type: Boolean,
      default: true,
    },

    // Classes that can access this curriculum (optional restriction)
    allowedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sclass",
      },
    ],

    // Time restrictions
    publishDate: {
      type: Date,
      default: null,
    },

    expireDate: {
      type: Date,
      default: null,
    },

    // Progress tracking
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "curriculums",
  }
);

// Indexes for searching and filtering
curriculumSchema.index({ name: "text", description: "text", topics: "text" });
curriculumSchema.index({ teacher: 1, createdAt: -1 });
curriculumSchema.index({ subject: 1, status: 1 });
curriculumSchema.index({ teacher: 1, status: 1 });

module.exports = mongoose.model("curriculum", curriculumSchema);
