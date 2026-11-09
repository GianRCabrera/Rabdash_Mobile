// Who can see and change other users' submissions (Nov 2026):
// - RabDash: sees and edits/deletes everyone's submissions.
// - CVO Admin: CVO's admin/IT staff. Sees everyone's submissions, but can
//   only edit/delete their own. Never self-registerable; accounts are made
//   with `npm run create-user` (scripts/createUser.js).
// - CVO and Private Veterinarian: own submissions only. CVO is
//   self-registerable, which is exactly why it must not see other users' data.
// Keep in sync with src/constants/roles.js on the frontend.
const VIEW_ALL_POSITIONS = ['RabDash', 'CVO Admin'];
const EDIT_ALL_POSITIONS = ['RabDash'];

// Positions selectable via public self-registration. RabDash and CVO Admin are
// deliberately excluded — they can see other users' data.
const SELF_REGISTERABLE_POSITIONS = ['Private Veterinarian', 'CVO'];

// Every position an account can have, for scripts/createUser.js.
const ALL_POSITIONS = ['Private Veterinarian', 'CVO', 'CVO Admin', 'RabDash'];

module.exports = { VIEW_ALL_POSITIONS, EDIT_ALL_POSITIONS, SELF_REGISTERABLE_POSITIONS, ALL_POSITIONS };
