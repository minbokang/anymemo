export const en = {
  app: {
    loading: 'Loading…',
  },
  lang: {
    switchToEn: 'English',
    switchToKo: '한국어',
    switchAria: 'Change language',
  },
  auth: {
    subtitleSignIn:
      'Mobile, Windows, and Mac supported—the same memos sync automatically across devices.',
    subtitleSignUp:
      'Mobile, Windows, and Mac supported—one account with real-time sync.',
    subtitleReset: 'Get a password reset link',
    email: 'Email',
    emailSignUpHint:
      'Use a real address for testing (e.g. Gmail). test@test.com is not allowed.',
    password: 'Password',
    showPassword: 'Show',
    hidePassword: 'Hide',
    showPasswordAria: 'Show password',
    hidePasswordAria: 'Hide password',
    rememberMe: 'Keep me signed in',
    rememberMeHint:
      'Stay logged in after closing the browser. Off signs out when the tab closes.',
    processing: 'Working…',
    signIn: 'Sign in',
    signUp: 'Sign up',
    sendLink: 'Send link',
    forgotPassword: 'Forgot your password?',
    switchToSignUp: "Don't have an account? Sign up",
    switchToSignIn: 'Already have an account? Sign in',
    backToSignIn: 'Back to sign in',
    signOut: 'Sign out',
    resetSent: 'We sent a password reset link to your email.',
    signUpConfirm:
      'Sign-up complete. Check your inbox for the confirmation link. (If email confirmation is off, you are signed in.)',
    signUpSuccess: 'Signed up and signed in.',
    signInSuccess: 'Signed in.',
    orDivider: 'or',
    continueWithGoogleSignIn: 'Sign in with Google',
    continueWithGoogleSignUp: 'Sign up with Google',
    contactGithub: 'GitHub',
    contactEmail: 'Contact email',
  },
  errors: {
    auth: {
      emailInvalid:
        'This email is not allowed by Supabase. Test addresses like test@test.com or user@example.com are blocked. Use a real domain (Gmail, Outlook, etc.).',
      rateLimit:
        'Supabase email rate limit reached (default SMTP: 2/hour). Wait about an hour or raise limits under Authentication → Rate Limits. For development, turn off Confirm email or enable auto-confirm.',
      alreadyRegistered: 'This email is already registered. Try signing in.',
      invalidCredentials: 'Incorrect email or password.',
      emailNotConfirmed:
        'Email confirmation required. Open the link in your inbox.',
      securityWait: 'Please try again in a moment.',
      oauthDisabled:
        'Google sign-in is not configured yet. Enable the Google provider in the Supabase dashboard.',
      generic: 'Request failed.',
    },
  },
  save: {
    pending: 'Waiting',
    saving: 'Saving…',
    saved: 'Saved',
    local: 'Saved locally',
    error: 'Save failed',
  },
  sync: {
    synced: 'Synced',
    offline: 'Offline',
    offlineWithCount: 'Offline · {{count}}',
    syncing: 'Syncing…',
    pending: 'Pending',
    pendingWithCount: 'Pending {{count}}',
    error: 'Sync failed',
    tapToSync: 'Tap to sync with server',
    tapToSyncAria: '{{label}}, tap to sync',
    refreshAll: 'Refresh all',
  },
  nav: {
    stats: 'Stats',
    backToMemos: 'Back to memos',
    memosTitle: 'Memos',
    statsTitle: 'Stats',
    help: 'Help',
    helpTitle: 'Help',
  },
  help: {
    title: 'Help',
    intro:
      'Use the same notes on your phone, tablet, computer, or browser. Sign in once—edits sync automatically. You can keep writing offline; changes upload when you are back online.',
    sectionPlatforms: 'Where can I use it?',
    platformWeb: 'Browser — open the site and start writing',
    platformPwa:
      'Phone or tablet — Add to Home Screen for an app-like experience (see the install banner)',
    platformDesktopMac:
      'Mac — install from the sign-in screen or GitHub Releases (Apple Silicon, v0.1.0)',
    platformDesktopWindows:
      'Windows — install from the sign-in screen or GitHub Releases (x64, v0.1.0)',
    platformMobile: 'iPhone and Android — app stores (coming soon)',
    sectionShortcuts: 'Shortcuts',
    shortcutNewMemo: '⌘N (Windows: Ctrl+N) — new memo',
    shortcutSearch: '/ — focus search (when not typing in a field)',
    shortcutEscape:
      'Esc — clear search · close dialogs · leave trash · back to list on mobile',
    sectionSlash: 'Slash commands in body',
    slashCalendar:
      '/calendar · /date — open date picker, inserts e.g. 2025.05.01',
    slashRelative:
      '/yesterday · /today · /tomorrow · /dayafter — insert that date',
    sectionEdit: 'Editing',
    editPin: 'Pin button — pin to top (red icon when pinned)',
    editReorder:
      'Desktop: drag ⠿ on the left to reorder (disabled while searching)',
    editExport: 'Download — save current memo or all memos as Markdown (.md)',
    sectionTrash: 'Trash',
    trashBody:
      'Deleted memos go to trash for 7 days, then are removed automatically. Restore or delete permanently from trash.',
    sectionSync: 'Sync',
    syncBody:
      'Memos sync to the server when signed in. Offline edits are saved locally and upload when online. Tap the sync badge to sync manually; ↻ refreshes everything.',
    sectionStats: 'Stats',
    statsBody:
      'Chart icon in the header shows memos created in the last 7 days, counts, and character totals.',
    sectionLang: 'Language',
    langBody:
      'Choose Korean or English on the sign-in screen (top right) after signing out.',
  },
  theme: {
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
  },
  search: {
    placeholder: 'Search memos…',
  },
  memo: {
    new: '+ New memo',
    createNew: 'Create new memo',
    emptyState: 'Select a memo or create a new one',
    titlePlaceholder: 'Title',
    contentPlaceholder: 'Write your note…',
    menuAria: 'Memo menu',
  },
  trash: {
    toggle: 'Trash',
    toggleWithCount: 'Trash ({{count}})',
    backToList: '← Memo list',
    empty: 'Trash is empty',
    deletedPrefix: 'Deleted',
    restore: 'Restore',
    permanentDelete: 'Delete forever',
    permanentDeleteConfirm:
      'This cannot be undone. Delete permanently?',
    footerHint: 'Auto-deleted after 7 days · Esc for list',
  },
  list: {
    loading: 'Loading…',
    empty: 'No memos yet',
    noResults: 'No results',
    backToList: '← List',
    backToListAria: 'Back to list',
    footerHint: '⌘N new memo · / search · Esc clear search',
  },
  reorder: {
    dragAria: 'Drag to reorder',
    dragDisabled: 'Cannot reorder while searching',
    dragHint: 'Drag to change order',
    moveUp: 'Move up',
    moveDown: 'Move down',
  },
  pin: {
    pin: 'Pin to top',
    unpin: 'Unpin',
    pinned: 'Pinned',
    pinAction: 'Pin',
  },
  editor: {
    download: 'Download',
    downloadAll: 'Download all',
    delete: 'Delete',
  },
  delete: {
    title: 'Delete this memo?',
    description:
      'Move “{{title}}” to trash. It will be deleted automatically after 7 days.',
  },
  slashDate: {
    hintFull:
      '/calendar · /date — pick date · /yesterday · /today · /tomorrow · /dayafter',
    hintMedium: '/calendar · /today · /yesterday · /tomorrow · /dayafter',
    hintShort: '/calendar · /today …',
    hintTitle:
      '/calendar · /date — pick date · /yesterday · /today · /tomorrow · /dayafter — inserts 2025.05.01',
  },
  datePicker: {
    title: 'Pick a date',
    closeAria: 'Close date picker',
    insert: 'Insert',
  },
  stats: {
    backToMemos: '← Memos',
    title: 'Stats',
    sectionMemos: 'Memos',
    sectionActivity: 'Activity',
    sectionVolume: 'Volume',
    total: 'Total',
    pinned: 'Pinned',
    trash: 'Trash',
    trashHint: 'Deleted memos',
    untitled: 'Untitled',
    updatedToday: 'Edited today',
    updatedTodayHint: 'Title or body changed',
    updatedThisWeek: 'Edited in 7 days',
    updatedThisWeekHint: 'Last week',
    empty: 'Empty memos',
    totalChars: 'Total characters',
    totalCharsHint: 'Title + body',
    avgChars: 'Average per memo',
    avgCharsHint: 'Characters',
    footerNote:
      'Based on memos loaded on this device · pin/reorder does not count as edits',
  },
  chart: {
    weeklyCreatedTitle: 'Created in the last 7 days',
    weeklyCreatedSubtitle: 'New memos · by created date',
    weeklyTotal: '{{count}} total',
    weeklyAria: 'Last 7 days chart, {{count}} total',
    today: 'Today',
    barTooltip: '{{date}} ({{weekday}}): {{count}}',
    barTooltipNoCount: '{{date}} ({{weekday}})',
  },
  install: {
    message:
      'Add to Home Screen for an app-like experience on this device. Syncs with the same account on web and desktop.',
    action: 'Install',
  },
  installGuide: {
    title: 'Use on other devices',
    expandHint: 'Tap to show install options',
    collapseHint: 'Tap to hide install options',
    subtitle: 'Sign in with the same account to keep your memos in sync.',
    recommendedHere: 'this device',
    web: 'Browser',
    openWeb: 'Open in browser',
    mobile: 'Phone · tablet',
    mobileHint:
      'Open this site in Safari or Chrome, then choose Add to Home Screen from the menu.',
    mac: 'Mac',
    downloadMac: 'Download for Mac',
    windows: 'Windows',
    downloadWindows: 'Download for Windows',
    allDownloads: 'All installers (GitHub)',
  },
  common: {
    untitled: 'Untitled',
    delete: 'Delete',
    cancel: 'Cancel',
    close: 'Close',
    deleting: 'Deleting…',
  },
  time: {
    justNow: 'Just now',
    minutesAgo: '{{n}}m ago',
    hoursAgo: '{{n}}h ago',
    daysAgo: '{{n}}d ago',
  },
  toast: {
    syncFailed: 'Sync failed. Will retry later.',
    uploadQueued: 'Uploading {{count}} memo(s) missing on the server.',
    serverListFailed: 'Could not load server list. Showing saved memos.',
    listLoadFailed: 'Could not load memo list.',
    remoteEditConflict:
      'This memo was edited on another device. Refresh to apply changes.',
    deleteFailed: 'Delete failed. Will retry when online.',
    restoreFailed: 'Restore failed.',
    permanentDeleteFailed: 'Permanent delete failed.',
    saveFailed: 'Save failed. Stored temporarily on this device.',
  },
}
