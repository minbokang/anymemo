export function formatAuthError(error) {
  const msg = error?.message ?? ''
  const code = error?.code ?? error?.error_code ?? ''

  if (
    code === 'email_address_invalid' ||
    msg.includes('is invalid') ||
    msg.includes('invalid format')
  ) {
    return (
      '이 이메일은 Supabase에서 허용하지 않습니다. ' +
      'test@test.com, user@example.com 같은 테스트 주소는 막혀 있습니다. ' +
      'Gmail·Outlook 등 실제 도메인을 사용해 주세요.'
    )
  }

  if (msg.includes('rate limit')) {
    return (
      'Supabase 이메일 발송 한도에 걸렸습니다 (기본 SMTP는 시간당 2통). ' +
      '1시간 정도 기다리거나, 대시보드 Authentication → Rate Limits에서 한도를 올려 주세요. ' +
      '개발 중에는 Confirm email 끄기·자동 확인을 켜 두면 가입 테스트가 수월합니다.'
    )
  }

  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return '이미 가입된 이메일입니다. 로그인을 시도해 주세요.'
  }

  if (msg.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }

  if (msg.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다. 메일함의 확인 링크를 눌러 주세요.'
  }

  return msg || '요청에 실패했습니다.'
}
