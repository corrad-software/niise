import { join } from "path";
import fs from "fs";

export default defineEventHandler(async (event) => {
  try {
    const { noSiri, jenisDokumen } = event.context.params;

    // Get the correct template based on jenisDokumen
    const templateName = `${jenisDokumen}.docx`;
    const templatePath = join(
      process.cwd(),
      "assets/document/templates",
      templateName
    );

    // Read file as buffer
    const buffer = fs.readFileSync(templatePath);

    // Set headers for file download
    setHeaders(event, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${jenisDokumen}.docx"`,
    });

    // Return buffer directly
    return buffer;
  } catch (error) {
    console.error("Error generating document:", error);
    return {
      statusCode: 500,
      message: "Error generating document",
    };
  }
});
