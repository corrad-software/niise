import { createReadStream } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';

export default defineEventHandler(async (event) => {
  try {
    const { noSiri, jenisDokumen } = event.context.params;

    // Get the correct template based on jenisDokumen
    const templateName = `${jenisDokumen}.doc`;
    const template = fs.readFileSync(
      join(process.cwd(), 'assets/document', templateName),
      'binary'
    );

    // Create zip object with the template
    const zip = new PizZip(template);
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Here you would fetch the actual data based on noSiri from your database
    // For now using dummy data
    const data = {
      noRujMakmal: "LAB2024-001",
      noRujTuan: "REF2024-001",
      tarikh: new Date().toLocaleDateString('ms-MY'),
      pejabat: "KLIA",
      noAduan: "ADU2024-001",
      tarikhAduan: new Date().toLocaleDateString('ms-MY'),
      pangkat: "Inspektor",
      nama: "Ahmad bin Abdullah",
      no: "ID-12345"
    };

    // Apply the data to the template
    doc.render(data);

    // Generate the document
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });

    // Save to existing document location
    const outputPath = join(process.cwd(), 'assets/document', `${jenisDokumen}.doc`);
    fs.writeFileSync(outputPath, buffer);

    // Set headers for file download
    setHeaders(event, {
      'Content-Type': 'application/msword',
      'Content-Disposition': `attachment; filename="${jenisDokumen}.doc"`,
    });

    // Return the file stream
    return createReadStream(outputPath);

  } catch (error) {
    console.error("Error generating document:", error);
    return {
      statusCode: 500,
      message: "Error generating document"
    };
  }
});