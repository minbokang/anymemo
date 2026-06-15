export const ko = {
  app: {
    loading: '로딩 중…',
  },
  lang: {
    switchToEn: 'English',
    switchToKo: '한국어',
    switchAria: '언어 변경',
  },
  auth: {
    subtitleSignIn:
      '모바일·Windows·Mac을 지원합니다. 같은 메모가 기기마다 자동으로 동기화됩니다.',
    subtitleSignUp:
      '모바일·Windows·Mac을 지원합니다. 한 계정으로 실시간 동기화됩니다.',
    subtitleReset: '비밀번호 재설정 링크 받기',
    email: '이메일',
    emailSignUpHint:
      '테스트 시 Gmail 등 실제 메일 주소를 사용하세요 (test@test.com 불가)',
    password: '비밀번호',
    showPassword: '보기',
    hidePassword: '숨기기',
    showPasswordAria: '비밀번호 보기',
    hidePasswordAria: '비밀번호 숨기기',
    rememberMe: '로그인 유지',
    rememberMeHint:
      '켜면 브라우저를 닫아도 로그인됩니다. 끄면 탭을 닫을 때 로그아웃됩니다.',
    processing: '처리 중…',
    signIn: '로그인',
    signUp: '회원가입',
    sendLink: '링크 보내기',
    forgotPassword: '비밀번호를 잊으셨나요?',
    switchToSignUp: '계정이 없으신가요? 회원가입',
    switchToSignIn: '이미 계정이 있으신가요? 로그인',
    backToSignIn: '로그인으로 돌아가기',
    signOut: '로그아웃',
    resetSent: '비밀번호 재설정 링크를 이메일로 보냈습니다.',
    signUpConfirm:
      '가입 완료. 이메일 확인 링크를 보냈습니다. (확인 비활성화 시 바로 로그인됩니다)',
    signUpSuccess: '가입 및 로그인되었습니다.',
    signInSuccess: '로그인되었습니다.',
    orDivider: '또는',
    continueWithGoogleSignIn: 'Google 계정으로 로그인',
    continueWithGoogleSignUp: 'Google 계정으로 가입',
    contactGithub: 'GitHub',
    contactEmail: '문의 메일',
  },
  errors: {
    auth: {
      emailInvalid:
        '이 이메일은 Supabase에서 허용하지 않습니다. test@test.com, user@example.com 같은 테스트 주소는 막혀 있습니다. Gmail·Outlook 등 실제 도메인을 사용해 주세요.',
      rateLimit:
        'Supabase 이메일 발송 한도에 걸렸습니다 (기본 SMTP는 시간당 2통). 1시간 정도 기다리거나, 대시보드 Authentication → Rate Limits에서 한도를 올려 주세요. 개발 중에는 Confirm email 끄기·자동 확인을 켜 두면 가입 테스트가 수월합니다.',
      alreadyRegistered: '이미 가입된 이메일입니다. 로그인을 시도해 주세요.',
      invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
      emailNotConfirmed:
        '이메일 인증이 필요합니다. 메일함의 확인 링크를 눌러 주세요.',
      securityWait: '잠시 후 다시 시도해 주세요.',
      oauthDisabled:
        'Google 로그인이 아직 설정되지 않았습니다. Supabase 대시보드에서 Google Provider를 켜 주세요.',
      generic: '요청에 실패했습니다.',
    },
  },
  save: {
    pending: '입력 대기',
    saving: '저장 중…',
    saved: '저장됨',
    local: '로컬 저장',
    error: '저장 실패',
  },
  sync: {
    synced: '서버 동기화됨',
    offline: '오프라인',
    offlineWithCount: '오프라인 · {{count}}',
    syncing: '동기화 중…',
    pending: '대기',
    pendingWithCount: '대기 {{count}}',
    error: '동기화 실패',
    tapToSync: '탭하여 서버와 동기화',
    tapToSyncAria: '{{label}}, 탭하여 동기화',
    refreshAll: '전체 새로고침',
  },
  nav: {
    stats: '통계',
    backToMemos: '메모로 돌아가기',
    memosTitle: '메모',
    statsTitle: '통계',
    help: '도움말',
    helpTitle: '도움말',
  },
  help: {
    title: '도움말',
    intro:
      '휴대폰, 태블릿, 컴퓨터, 브라우저 어디서나 같은 메모를 이어 쓸 수 있습니다. 로그인한 계정으로 작성·수정한 내용은 자동으로 맞춰지고, 잠시 오프라인이어도 저장 후 연결되면 동기화됩니다.',
    sectionPlatforms: '어디서 쓸 수 있나요?',
    platformWeb: '브라우저 — 주소만 열면 바로 사용',
    platformPwa:
      '휴대폰·태블릿 — 「홈 화면에 추가」하면 앱처럼 실행 (상단 설치 안내 참고)',
    platformDesktopMac:
      'Mac — 로그인 화면 또는 GitHub Releases에서 설치 (Apple Silicon, v0.1.0)',
    platformDesktopWindows:
      'Windows — 로그인 화면 또는 GitHub Releases에서 설치 (x64, v0.1.0)',
    platformMobile: 'iPhone·Android — 앱 스토어 (준비 중)',
    sectionShortcuts: '단축키',
    shortcutNewMemo: '⌘N (Windows: Ctrl+N) — 새 메모',
    shortcutSearch: '/ — 검색창 포커스 (입력 중이 아닐 때)',
    shortcutEscape:
      'Esc — 검색 지우기 · 삭제 확인 닫기 · 휴지통 나가기 · 모바일에서 목록',
    sectionSlash: '본문 슬래시 명령',
    slashCalendar:
      '/달력 · /date · /날짜 — 날짜 선택 후 삽입 (예: 2025.05.01)',
    slashRelative: '/어제 · /오늘 · /내일 · /모레 — 해당 날짜 바로 삽입',
    sectionEdit: '메모 편집',
    editPin: '핀 버튼 — 상단 고정·해제 (고정 시 빨간 아이콘)',
    editReorder:
      '데스크톱: 목록 왼쪽 ⠿ 드래그로 순서 변경 (검색 중에는 불가)',
    editExport: '다운로드 — 현재 메모 또는 전체를 Markdown(.md)으로 저장',
    sectionTrash: '휴지통',
    trashBody:
      '삭제한 메모는 휴지통으로 이동합니다. 7일 후 자동 삭제됩니다. 복원·영구 삭제가 가능합니다.',
    sectionSync: '동기화',
    syncBody:
      '로그인 시 서버와 자동 동기화됩니다. 오프라인에서는 기기에 저장 후, 연결되면 업로드됩니다. 상단 동기화 배지를 탭하면 수동 동기화할 수 있고, ↻ 버튼은 전체 새로고침입니다.',
    sectionStats: '통계',
    statsBody:
      '헤더의 차트 아이콘에서 최근 7일 작성 수, 고정·휴지통·글자 수 등을 볼 수 있습니다.',
    sectionLang: '언어',
    langBody:
      '한국어 / English는 로그아웃 후 로그인 화면 우측에서 선택합니다.',
  },
  theme: {
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
  },
  search: {
    placeholder: '메모 검색…',
  },
  memo: {
    new: '+ 새 메모',
    createNew: '새 메모 만들기',
    emptyState: '메모를 선택하거나 새 메모를 만드세요',
    titlePlaceholder: '제목',
    contentPlaceholder: '내용을 입력하세요…',
    menuAria: '메모 메뉴',
  },
  trash: {
    toggle: '휴지통',
    toggleWithCount: '휴지통 ({{count}})',
    backToList: '← 메모 목록',
    empty: '휴지통이 비었습니다',
    deletedPrefix: '삭제',
    restore: '복원',
    permanentDelete: '영구 삭제',
    permanentDeleteConfirm:
      '영구 삭제하면 복구할 수 없습니다. 계속할까요?',
    footerHint: '7일 후 자동 삭제 · Esc 목록',
  },
  list: {
    loading: '불러오는 중…',
    empty: '메모가 없습니다',
    noResults: '검색 결과 없음',
    backToList: '← 목록',
    backToListAria: '목록으로',
    footerHint: '⌘N 새 메모 · / 검색 · Esc 검색 지우기',
  },
  reorder: {
    dragAria: '순서 변경 드래그',
    dragDisabled: '검색 중 순서 변경 불가',
    dragHint: '드래그하여 순서 변경',
    moveUp: '위로',
    moveDown: '아래로',
  },
  pin: {
    pin: '상단 고정',
    unpin: '고정 해제',
    pinned: '고정됨',
    pinAction: '고정',
  },
  editor: {
    copy: '본문 복사',
    download: '다운로드',
    downloadAll: '전체 다운로드',
    delete: '삭제',
  },
  delete: {
    title: '메모를 삭제할까요?',
    description:
      '「{{title}}」을(를) 휴지통으로 옮깁니다. 7일 후 자동 삭제됩니다.',
  },
  slashDate: {
    hintFull:
      '/달력 · /date · /날짜 — 날짜 선택 · /어제 · /오늘 · /내일 · /모레',
    hintMedium: '/달력 · /오늘 · /어제 · /내일 · /모레',
    hintShort: '/달력 · /오늘 등',
    hintTitle:
      '/달력 · /date · /날짜 — 날짜 선택 · /어제 · /오늘 · /내일 · /모레 — 날짜 삽입 (2025.05.01)',
  },
  datePicker: {
    title: '날짜 선택',
    closeAria: '날짜 선택 닫기',
    insert: '삽입',
  },
  stats: {
    backToMemos: '← 메모',
    title: '통계',
    sectionMemos: '메모',
    sectionActivity: '활동',
    sectionVolume: '분량',
    total: '전체',
    pinned: '고정',
    trash: '휴지통',
    trashHint: '삭제된 메모',
    untitled: '제목 없음',
    updatedToday: '오늘 수정',
    updatedTodayHint: '내용·제목 변경 기준',
    updatedThisWeek: '7일 안 수정',
    updatedThisWeekHint: '최근 일주일',
    empty: '빈 메모',
    totalChars: '총 글자',
    totalCharsHint: '제목 + 본문',
    avgChars: '메모당 평균',
    avgCharsHint: '글자 수',
    footerNote:
      '기기에 불러온 메모 기준 · 고정·순서 변경은 수정 수에 포함되지 않습니다',
  },
  chart: {
    weeklyCreatedTitle: '최근 7일 작성',
    weeklyCreatedSubtitle: '새 메모 · 작성일 기준',
    weeklyTotal: '총 {{count}}개',
    weeklyAria: '최근 7일 작성 그래프, 합계 {{count}}개',
    today: '오늘',
    barTooltip: '{{date}} ({{weekday}}): {{count}}개',
    barTooltipNoCount: '{{date}} ({{weekday}})',
  },
  install: {
    message:
      '홈 화면에 추가하면 이 기기에서도 앱처럼 쓸 수 있습니다. 다른 기기·웹·데스크톱과 동일 계정으로 동기화됩니다.',
    action: '설치',
  },
  installGuide: {
    title: '다른 기기에서 사용하기',
    expandHint: '눌러서 설치 안내 보기',
    collapseHint: '눌러서 설치 안내 닫기',
    subtitle: '같은 계정으로 로그인하면 메모가 자동으로 맞춰집니다.',
    recommendedHere: '이 기기',
    web: '브라우저',
    openWeb: '웹에서 열기',
    mobile: '휴대폰 · 태블릿',
    mobileHint:
      'Safari 또는 Chrome으로 이 주소에 접속한 뒤, 메뉴에서 「홈 화면에 추가」를 선택하세요.',
    mac: 'Mac',
    downloadMac: 'Mac 앱 다운로드',
    windows: 'Windows',
    downloadWindows: 'Windows 앱 다운로드',
    allDownloads: '모든 설치 파일 (GitHub)',
  },
  common: {
    untitled: '제목 없음',
    delete: '삭제',
    cancel: '취소',
    close: '닫기',
    deleting: '삭제 중…',
  },
  time: {
    justNow: '방금',
    minutesAgo: '{{n}}분 전',
    hoursAgo: '{{n}}시간 전',
    daysAgo: '{{n}}일 전',
  },
  toast: {
    syncFailed: '동기화에 실패했습니다. 나중에 다시 시도됩니다.',
    uploadQueued: '{{count}}개 메모가 서버에 없어 업로드를 시도합니다.',
    serverListFailed:
      '서버 목록을 불러오지 못했습니다. 저장된 메모를 표시합니다.',
    listLoadFailed: '메모 목록을 불러오지 못했습니다.',
    remoteEditConflict:
      '다른 기기에서 이 메모가 수정되었습니다. 새로고침하면 반영됩니다.',
    deleteFailed: '삭제에 실패했습니다. 연결되면 다시 시도합니다.',
    restoreFailed: '복원에 실패했습니다.',
    permanentDeleteFailed: '영구 삭제에 실패했습니다.',
    saveFailed: '저장에 실패했습니다. 기기에 임시 저장했습니다.',
    copySuccess: '본문을 복사했습니다.',
    copyEmpty: '복사할 본문이 없습니다.',
    copyFailed: '복사에 실패했습니다.',
  },
}
