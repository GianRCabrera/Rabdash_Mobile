// PROVISIONAL (Sep 2026, not finalized — see CLAUDE.md): RabDash is currently the
// only true reviewer role (sees/edits everyone's submissions). CVO is a real,
// self-registerable position, but is intentionally scoped like Private
// Veterinarian (own submissions only) until a proper elevated-CVO tier is
// designed. Named REVIEWER_POSITIONS rather than CVO_POSITIONS specifically so
// this doesn't read as "CVO is a reviewer" when it currently excludes CVO.
const REVIEWER_POSITIONS = ['RabDash'];

// Positions selectable via public self-registration. RabDash is deliberately
// excluded — that's still provisioned separately, never through this form.
const SELF_REGISTERABLE_POSITIONS = ['Private Veterinarian', 'CVO'];

module.exports = { REVIEWER_POSITIONS, SELF_REGISTERABLE_POSITIONS };
