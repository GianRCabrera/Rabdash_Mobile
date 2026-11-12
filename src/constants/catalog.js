import { usesVetMenu } from './roles';

// Every form the app offers, in display order. `vetOnly` items are shown to
// CVO, CVO Admin and RabDash (usesVetMenu); everyone else (Private
// Veterinarian, or an unknown position) gets the rest. This one list drives
// the Forms, Records and Downloads screens, so a form's title, icon and
// screens are defined in one place. `icon` is a MaterialCommunityIcons name.
export const FORMS = [
  {
    key: 'vaccination', group: 'Field work', vetOnly: false, icon: 'needle',
    title: 'Rabies Field Vaccination', subtitle: 'Vaccinations given in the field',
    route: 'Rabies_Field_Vacc_Form', archiveRoute: 'Field_vacc_archives',
  },
  {
    key: 'neuter', group: 'Field work', vetOnly: false, icon: 'content-cut',
    title: 'Neuter', subtitle: 'Spay/neuter procedures and owner consent',
    route: 'Neuter_Form', archiveRoute: 'Neuter_Form_archive',
  },
  {
    key: 'sample', group: 'Field work', vetOnly: false, icon: 'test-tube',
    title: 'Rabies Sample Information', subtitle: 'Samples sent for rabies testing',
    route: 'Rabies_Sample_Information_Form', archiveRoute: 'Sample_form_archive',
  },
  {
    key: 'exposure', group: 'Field work', vetOnly: true, icon: 'hospital-box-outline',
    title: 'Human Rabies Exposure', subtitle: 'Bites and other exposures in people',
    route: 'Rabies_Exposure_Form1', archiveRoute: 'Rabies_Exposure_Form_Archive',
  },
  {
    key: 'animalControl', group: 'Field work', vetOnly: true, icon: 'dog-side',
    title: 'Animal Control', subtitle: 'Animal control and rehabilitation report',
    route: 'AnimalControlForm', archiveRoute: 'AnimalControlArchives',
  },
  {
    key: 'schedule', group: 'Office reports', vetOnly: true, icon: 'calendar-month',
    title: 'Schedule / Event', subtitle: 'Planned activities and events',
    route: 'ScheduleForm', archiveRoute: 'ScheduleFormArchive',
  },
  {
    key: 'iec', group: 'Office reports', vetOnly: true, icon: 'bullhorn',
    title: 'Seminars / Trainings / IEC', subtitle: 'Information and education activities',
    route: 'IECForm', archiveRoute: 'IECFormArchive',
  },
  {
    key: 'budget', group: 'Office reports', vetOnly: true, icon: 'cash-multiple',
    title: 'Budget', subtitle: 'Annual budget and vaccine costs',
    route: 'BudgetForm', archiveRoute: 'BudgetFormArchive',
  },
];

// The downloadable Excel templates served by the backend at
// /assets/templates/<file>.
export const DOWNLOADS = [
  { key: 'vaccination', vetOnly: false, title: 'Rabies Vaccination', file: 'Vaccination_Report_form.xlsx' },
  { key: 'neuter', vetOnly: false, title: 'Neuter', file: 'Neuter_Report_form.xlsx' },
  { key: 'sample', vetOnly: false, title: 'Rabies Sample Information', file: 'Rabies_Sample_Report_form.xlsx' },
  { key: 'exposure', vetOnly: true, title: 'Human Rabies Exposure', file: 'Rabies_Exposure_Report_form.xlsx' },
  { key: 'animalControl', vetOnly: true, title: 'Animal Control and Rehabilitation', file: 'Daily_Report_form.xlsx' },
  { key: 'schedule', vetOnly: true, title: 'Schedule / Event', file: 'Schedule_Report_form.xlsx' },
  { key: 'iec', vetOnly: true, title: 'Seminars / Trainings / IEC', file: 'IEC_Report_form.xlsx' },
  { key: 'budget', vetOnly: true, title: 'Budget', file: 'Budget_Report_form.xlsx' },
];

const forPosition = (items, position) => (usesVetMenu(position) ? items : items.filter((item) => !item.vetOnly));

export const formsFor = (position) => forPosition(FORMS, position);
export const downloadsFor = (position) => forPosition(DOWNLOADS, position);

// Groups items by their `group` field, keeping display order:
// [{ title, items }, ...].
export const groupItems = (items) =>
  items.reduce((groups, item) => {
    const last = groups[groups.length - 1];
    if (last && last.title === item.group) last.items.push(item);
    else groups.push({ title: item.group, items: [item] });
    return groups;
  }, []);
