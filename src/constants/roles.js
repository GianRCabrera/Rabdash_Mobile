// Who sees what (Nov 2026). Keep in sync with backend/constants.js, which is
// the real authority; these only decide menus and which screens/buttons show.
// - RabDash: sees and can edit/delete everyone's submissions.
// - CVO Admin: CVO's admin/IT staff. Sees everyone's submissions, but can only
//   edit/delete their own. Created with `npm run create-user` in backend/.
// - CVO, Private Veterinarian: own submissions only.

// Positions that use the VetMenu screens rather than MainMenu.
export const VET_MENU_POSITIONS = ['CVO', 'RabDash', 'CVO Admin'];
export const VIEW_ALL_POSITIONS = ['RabDash', 'CVO Admin'];
export const EDIT_ALL_POSITIONS = ['RabDash'];

export const usesVetMenu = (position) => VET_MENU_POSITIONS.includes(position);
export const canViewAll = (position) => VIEW_ALL_POSITIONS.includes(position);

// Whether to show Edit/Delete on `record` (the backend enforces the real
// rule). Only a view-all-but-not-edit-all user (CVO Admin) ever sees other
// people's records, so everyone else always gets the buttons; comparing
// emails for them could hide buttons on their own records over a
// capitalization difference.
export const canEditRecord = (user, record) => {
  if (!canViewAll(user?.position) || EDIT_ALL_POSITIONS.includes(user?.position)) return true;
  return (record?.username || '').toLowerCase() === (user?.email || '').toLowerCase();
};
