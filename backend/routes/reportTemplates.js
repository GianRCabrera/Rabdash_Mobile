const express = require('express');
const path = require('path');

const router = express.Router();

// Downloadable .xlsx templates for each form type's report format,
// consumed by DownloadableForms.js/DownloadableFormsPrivVet.js on the
// frontend (via expo-document-picker/expo-file-system/expo-sharing).
const TEMPLATES = [
  'Vaccination_Report_form.xlsx',
  'Neuter_Report_form.xlsx',
  'Rabies_Sample_Report_form.xlsx',
  'IEC_Report_form.xlsx',
  'Daily_Report_form.xlsx',
  'Schedule_Report_form.xlsx',
  'Budget_Report_form.xlsx',
  'Rabies_Exposure_Report_form.xlsx',
];

TEMPLATES.forEach((filename) => {
  router.get(`/${filename}`, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'assets', 'templates', filename));
  });
});

module.exports = router;
