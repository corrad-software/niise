import { join } from "path";
import fs from "fs";
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const { noSiri, jenisDokumen } = event.context.params;

    // Validate input parameters
    if (!noSiri || !jenisDokumen) {
      throw createError({
        statusCode: 400,
        message: "Missing required parameters",
      });
    }

    // Get the correct template based on jenisDokumen
    const templateName = `${jenisDokumen}.docx`;

    // Determine the base path based on environment
    const basePath =
      process.env.SERVER === "true"
        ? join(process.cwd(), ".output/public/uploads")
        : join(process.cwd(), "public/uploads");

    const templatePath = join(basePath, templateName);

    // Check if file exists
    if (!fs.existsSync(templatePath)) {
      throw createError({
        statusCode: 404,
        message: "Template file not found",
      });
    }

    // Read file as buffer
    const buffer = fs.readFileSync(templatePath);

    // Set headers for file download
    setHeaders(event, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${jenisDokumen}.docx"`,
      "Content-Length": buffer.length,
    });

    // Return buffer directly
    return buffer;
  } catch (error) {
    console.error("Error generating document:", error);

    // Proper error handling
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error generating document",
    });
  }
});
